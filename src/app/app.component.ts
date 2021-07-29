import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Empresa } from './shared/modelos/empresa';
import { ShareEmpresaService } from './shared/services/share-empresa.service';
import { EmpresaService } from './pages-admin/empresa/empresa.service';
import { CarritoService } from './pages-store/carrito/carrito.service';
import { AuthService } from './usuarios/auth.service';
import { ShowErrorService } from './shared/services/show-error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Restaurante demo';
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  empresa: Empresa;

  constructor(
    private empresaService: EmpresaService,
    private shareEmpresaService: ShareEmpresaService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private showErrorService: ShowErrorService
    ) {
      console.log('arranque app.component, username: ---------------------------');
      console.log(this.authService.usuario.username);
      this.getEmpresa(1);
  }

  ngOnInit(): void {

  }

  getEmpresa(id: number): void {
    this.observ$ = this.empresaService.get(id).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.empresa = json;
          document.title = this.empresa.nombre;
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
  }
}
