import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import swal from 'sweetalert2';

import { Tipoplato } from '../../shared/modelos/tipoplato';
import { ModalService } from '../../shared/services/modal.service';
import { AdminTipoplatoService } from './admin-tipoplato.service';
import { environment } from 'src/environments/environment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConModeloService } from '../../shared/services/modal-con-modelo.service';
import { AuthService } from 'src/app/usuarios/auth.service';
import { Router } from '@angular/router';
import { TipoplatoFormComponent } from './tipoplato-form/tipoplato-form.component';
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
  selector: 'app-admin-tipoplato',
  templateUrl: './admin-tipoplato.component.html',
  styleUrls: ['./admin-tipoplato.component.scss']
})

export class AdminTipoplatoComponent implements OnInit, OnDestroy {

  tipoplatos: Tipoplato[];
  tipoplato: Tipoplato = new Tipoplato();

  private unsubscribe$ = new Subject<void>();
  private observ$: Subscription = null;

  public tituloBody: string;
  host: string = environment.urlEndPoint;
  public tipoplatovacio: Tipoplato = new Tipoplato();

  constructor(
    private tipoplatoService: AdminTipoplatoService,
    private modalService: ModalService,
    private modalConModeloService: ModalConModeloService,
    public authService: AuthService,
    private router: Router,
    private showErrorService: ShowErrorService
  ) {
  }

  ngOnInit(): void {
    this.subcripcionTipoplatos();
  }

  subcripcionTipoplatos(): void {
    this.tipoplatoService.getTipoplatos().pipe(
      takeUntil(this.unsubscribe$),
      tap((response: any) => {
      }),
    ).subscribe(
      response => {
        this.tipoplatos = (response as Tipoplato[]);
      }
      , err => {this.showErrorService.httpErrorResponse(err, 'Error carga tipo de plato', '', 'error');
      }
    );
  }

  public create(): void {
    this.openModal(new Tipoplato());
  }

  public delete(tipoplato: Tipoplato): void {
    swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el grupo de platos: ${tipoplato.label}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.tipoplatoService.delete(tipoplato.id).subscribe(
          response => {
            this.tipoplatoService.getTipoplatos().subscribe(respon => {
              this.tipoplatos = (respon as Tipoplato[]);
            });
          }
          , err => {this.showErrorService.httpErrorResponse(err, 'Error eliminando tipo-plato', '', 'error');
          }
        );
      }
    });

  }

  public update(tipoplato: Tipoplato): void {
    this.openModal(tipoplato);
  }

  public openModal(tipoplato: Tipoplato): void {

    this.modalConModeloService.openModalScrollable(
      TipoplatoFormComponent,
      { size: 'lg', backdrop: 'static', scrollable: true },
      tipoplato,
      'tipoplato',
      'Los campos con * son obligatorios',
      'Clasificación de platos'
    ).pipe(
      take(1) // take() manages unsubscription for us
    ).subscribe(result => {
      this.tipoplatoService.getTipoplatos().subscribe(respon => {
        this.tipoplatos = respon as Tipoplato[];
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
      tipoplato => {
        console.log('recibido evento fin Upload');
        this.tipoplatos.map(tipoplatoOriginal => {
          if (tipoplatoOriginal.id === tipoplato.id) {
            tipoplatoOriginal.imgFileName = tipoplato.imgFileName;
          }
          return tipoplatoOriginal;
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
