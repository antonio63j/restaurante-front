import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import swal from 'sweetalert2';

import { ModalService } from '../../shared/services/modal.service';
import { AdminMenuService } from '../../pages-admin/admin-menu/admin-menu.service';
import { environment } from '../../../environments/environment';
import { ModalConModeloService } from '../../shared/services/modal-con-modelo.service';
import { AuthService } from '../../usuarios/auth.service';
import { Menu } from 'src/app/shared/modelos/menu';
import { MenuDetalleComponent } from './menu-detalle/menu-detalle.component';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

const swalWithBootstrapButtons = swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy{

  menus: Menu[];
  menu: Menu = new Menu();

  private unsubscribe$ = new Subject();
  private observ$: Subscription = null;

  host: string = environment.urlEndPoint;
  public menuvacio: Menu = new Menu();

  constructor(
    private menuService: AdminMenuService,
    private modalService: ModalService,
    private modalConModeloService: ModalConModeloService,
    public authService: AuthService,
    private router: Router,
    private showErrorService: ShowErrorService
  ) {
  }

  ngOnInit(): void {
    this.subcripcionMenus();
  }

  subcripcionMenus(): void {
    this.menuService.getMenusVisibles().pipe(
      takeUntil(this.unsubscribe$),
      tap((response: any) => {
      }),
    ).subscribe(
      response => {
        this.menus = (response as Menu[]);
      }
      , err => {this.showErrorService.httpErrorResponse(err, 'Error carga de menus', '', 'error');
      }
    );
  }

  public comprar(menu: Menu): void {
     this.openModal(menu);
  }

  public salir(): void {
  }

  public create(): void {
    this.openModal(new Menu());
  }

  public update(menu: Menu): void {
    this.openModal(menu);
  }

  public openModal(menu: Menu): void {
    this.modalConModeloService.openModalScrollable(
      MenuDetalleComponent,
      { size: 'lg', backdrop: 'static', scrollable: true },
      menu,
      'menu',
      'Los campos con * son obligatorios',
      'Datos del menu'
    ).pipe(
      take(1) // take() manages unsubscription for us
    ).subscribe(result => {
      this.menuService.getMenus().subscribe(respon => {
        this.menus = respon as Menu[];
      });
    });
  }

  subscripcioneventoCerrarModalScrollable(): void {
    this.modalService.eventoCerrarModalScrollable.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(
      () => {
        console.log('recibido evento para cerrar modal');
        this.modalConModeloService.closeModalScrollable();
      }
    );
  }

  subscripcioneventoNotificacionUpload(): void {
    this.modalService.eventoNotificacionUpload.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(
      menu => {
        console.log('recibido evento fin Upload');
        this.menus.map(menuOriginal => {
          if (menuOriginal.id === menu.id) {
            menuOriginal.imgFileName = menu.imgFileName;
          }
          return menuOriginal;
        }); // map
      }
    );
  }


  ngOnDestroy(): void {
    console.log('ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
