import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../usuarios/auth.service';

import { HttpParams } from '@angular/common/http';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Empresa } from '../../shared/modelos/empresa';
import { ShareEmpresaService } from '../../shared/services/share-empresa.service';
import { CarritoService } from '../../pages-store/carrito/carrito.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{

    public pushRightClass: string;

    // public dropdownList = [];
    // public selectedItems = [];
    // public dropdownSettings: IDropdownSettings = {};

    // private observ$: Subscription = null;
    // private unsubscribe$ = new Subject();
    // public dropdownSettings: any = {};

    public empresa: Empresa = new Empresa();
    public subscripcionDatosEmpresa: Subscription;
    public hiddenProductosEnCarrito = false;
    public numArticulosCarrito = 0;
    public subscripcionNumArticulosEnCarrito: Subscription;


    constructor(
        private translate: TranslateService,
        public router: Router,
        public authService: AuthService,
        public shareEmpresaService: ShareEmpresaService,
        public carritoService: CarritoService
    ) {
        this.router.events.subscribe((val) => {
            // console.log('en gestion router.events');
            // console.log(val);
            // console.log(window.innerWidth);
            // console.log(this.isToggled());

            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                console.log('se invoca toggleSidebar()');
                this.toggleSidebar();
            }
        });
    }

    ngOnInit(): void {
        this.pushRightClass = 'push-right';
        this.subscripcionDatosEmpresa = this.shareEmpresaService.getEmpresaMsg()
          .subscribe(msg => {
              console.log('recibido cambio datos empresa');
              this.empresa = msg;
            });
        this.subscripcionNumArticulosEnCarrito = this.carritoService.getNumArticulosCarritoMsg()
          .subscribe(num => {
              console.log('recibido cambios datos carrito, numArticulos= ' + num);
              this.numArticulosCarrito = num;
          });
    }

    onItemSelect(item: any): void {
        console.log(item);
    }
    onSelectAll(items: any): void {
        console.log(items);
    }


    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar(): void {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr(): void {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout(): void {
        // localStorage.removeItem('isLoggedin');
        this.authService.logout();
        this.router.navigate(['\dashboard']);
    }

    changeLang(language: string): void {
        this.translate.use(language);
    }

    ngOnDestroy(): void {
        this.subscripcionDatosEmpresa.unsubscribe(); // onDestroy cancels the subscribe request
    }

}
