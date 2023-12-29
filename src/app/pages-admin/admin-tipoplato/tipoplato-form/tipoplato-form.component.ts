import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import swal from 'sweetalert2';

import { Tipoplato } from '../../../shared/modelos/tipoplato';
import { ModalService } from '../../../shared/services/modal.service';
import { AdminTipoplatoService } from '../admin-tipoplato.service';
import { environment } from 'src/environments/environment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

@Component({
  selector: 'app-tipoplato-form',
  templateUrl: './tipoplato-form.component.html',
  styleUrls: ['./tipoplato-form.component.scss']
})

export class TipoplatoFormComponent implements OnInit, OnDestroy {

  host: string = environment.urlEndPoint;
  public tipoplato: Tipoplato;
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject<void>();
  public erroresValidacion: string[];

  constructor(
    private adminTipoplatoService: AdminTipoplatoService,
    private modalService: ModalService,
    public activeModal: NgbActiveModal,
    private showErrorService: ShowErrorService
  ) { }

  ngOnInit(): void {
  }

  public update(tipoplato: Tipoplato): void {
    this.observ$ = this.adminTipoplatoService.update(tipoplato).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.tipoplato = json.data;

          // se está utilizando activeModal.close(true) en template
          // this.modalService.eventoCerrarModalScrollable.emit();
          swal.fire('tipoplato actualizado', `${json.mensaje}, label: ${json.data.label}`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {this.showErrorService.httpErrorResponse(err, 'Error actualización tipo plato', '', 'error');
          }
        }
      );
  }
  public create(tipoplato: Tipoplato): void {
    this.observ$ = this.adminTipoplatoService.create(tipoplato).pipe(
      takeUntil(this.unsubscribe$)
      /*      , catchError(err => {
               console.log('Se muestra el error y se vuelve a lanzar con throwError(err)', err);
               return throwError(err);
            }) */
    )
      .subscribe(
        json => {
          this.tipoplato = json.data;
          // this.activeModal.close(true);
          // el cierre del modal se podría hacer con:

          // se está utilizando activeModal.close(true) desde el template
          // this.modalService.eventoCerrarModalScrollable.emit();

          // en lugar de activModal.close(true), se podría emitir evento
          // para cerrar modal con:
          // this.modalService.eventoCerrarModalScrollable.emit();
          // podriamos emitir este evento para cerrar modal con la
          // subscripcion que se hace con subscripcioneventoCerrarModalScrollable()
          // desde ClientesComponent

          swal.fire('creado tipo, no olvide asociar una foto', `${json.mensaje}, nombre: ${json.data.nombre}`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {this.showErrorService.httpErrorResponse(err, 'Error creación tipo plato', '', 'error');
          }
        }
      );
  }

  ngOnDestroy(): void{
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
