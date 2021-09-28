import { Component, OnDestroy, OnInit,  Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Empresa } from './shared/modelos/empresa';
import { ShareEmpresaService } from './shared/services/share-empresa.service';
import { EmpresaService } from './pages-admin/empresa/empresa.service';
import { CarritoService } from './pages-store/carrito/carrito.service';
import { AuthService } from './usuarios/auth.service';
import { ShowErrorService } from './shared/services/show-error.service';
import { ConectorSocketService } from './shared/services/conector-socket.service';

import { NgcCookieConsentService, NgcInitializeEvent, NgcNoCookieLawEvent, NgcStatusChangeEvent } from 'ngx-cookieconsent';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  empresa: Empresa;

  // keep refs to subscriptions to be able to unsubscribe later
  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;

  constructor(
    private empresaService: EmpresaService,
    private shareEmpresaService: ShareEmpresaService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private showErrorService: ShowErrorService,
    private conectorSocketService: ConectorSocketService,
    private ccService: NgcCookieConsentService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: string,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    console.log('arranque app.component, username: ---------------------------');
    console.log(this.authService.usuario.username);
    this.getEmpresa(1);
    this.conectorSocketService.connect();
  }

  ngOnInit(): void {
    this.setTittleAndMetaTags();
    if (isPlatformBrowser(this.platformId)) {
      this.prepararCookieService();
    }
  }

  setTittleAndMetaTags(): void {
    this.titleService.setTitle(`Restaurante`);

    this.metaTagService.addTags([
      { name: 'keywords', content: 'menu para llevar, menu para recoger, cocina con productos de primera calidad'},
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Restaurante'},
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'web pedidos de comida online' }
      // { name: 'date', content: '2019-10-31', scheme: 'YYYY-MM-DD' }
    ]);
  }

  prepararCookieService(): void {

    // Support for translated cookies messages

    // this.translateService.addLangs(['en', 'es']);
    // this.translateService.setDefaultLang('en');

    // const browserLang = this.translateService.getBrowserLang();
    // this.translateService.use(browserLang.match(/en|es/) ? browserLang : 'en');

    this.translateService//
      .get(['cookie.header', 'cookie.message', 'cookie.dismiss', 'cookie.allow', 'cookie.deny', 'cookie.link', 'cookie.policy'])
      .subscribe(data => {

        this.ccService.getConfig().content = this.ccService.getConfig().content || {} ;
        // Override default messages with the translated ones
        this.ccService.getConfig().content.header = data['cookie.header'];
        this.ccService.getConfig().content.message = data['cookie.message'];
        this.ccService.getConfig().content.dismiss = data['cookie.dismiss'];
        this.ccService.getConfig().content.allow = data['cookie.allow'];
        this.ccService.getConfig().content.deny = data['cookie.deny'];
        this.ccService.getConfig().content.link = data['cookie.link'];
        this.ccService.getConfig().content.policy = data['cookie.policy'];

        this.ccService.destroy(); // remove previous cookie bar (with default messages)
        this.ccService.init(this.ccService.getConfig()); // update config with translated messages
      });

    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('popupOpenSubscription');
        console.log(this.ccService.getConfig());
      });

    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('popupCloseSubscription');

      });

    this.initializeSubscription = this.ccService.initialize$.subscribe(
      (event: NgcInitializeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('initializeSubscription');

      });

    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('statusChangeSubscription');

      });

    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('revokeChoiceSubscription');

      });

    this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event: NgcNoCookieLawEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log('noCookieLawSubscription');

      });

  }

  getEmpresa(id: number): void {
    this.observ$ = this.empresaService.get(id).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.empresa = json;
          if (isPlatformBrowser(this.platformId)) {
            document.title = this.empresa.nombre;
          }
          // this.carritoService.cargaCarrito();
          this.shareEmpresaService.updateEmpresaMsg(this.empresa);
          console.log('enviado cambio datos empresa');
        }
        , err => this.showErrorService.httpErrorResponse(err, 'Carga datos de empresa', '', 'error')
      );
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.observ$ != null && !this.observ$.closed) {
      console.log('haciendo : this.observ$.unsubscribe()');
      this.observ$.unsubscribe();
    } else {
      console.log('No necesario hacer: this.observ$.unsubscribe()');
    }
    // unsubscribe to cookieconsent observables to prevent memory leaks

    if (isPlatformBrowser(this.platformId)) {
      this.popupOpenSubscription.unsubscribe();
      this.popupCloseSubscription.unsubscribe();
      this.initializeSubscription.unsubscribe();
      this.statusChangeSubscription.unsubscribe();
      this.revokeChoiceSubscription.unsubscribe();
      this.noCookieLawSubscription.unsubscribe();
    }
  }
}
