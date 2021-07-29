import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../shared/services/modal.service';
import { AuthService } from '../../auth.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Usuario } from '../../../shared/modelos/usuario';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.scss']
})
export class SignupModalComponent implements OnInit, OnDestroy {

  public usuario: Usuario = new Usuario();
  public password2 = '';
  public hide = true;
  public aceptoCondiciones = true;
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject();

  constructor(
    public authService: AuthService,
    public activeModal: NgbActiveModal,
    private modalService: ModalService,
    private translate: TranslateService,
    private location: Location,
    private showErrorService: ShowErrorService

  ) { }

  ngOnInit(): void {
  }

  signup(usuario): void {
    usuario.roles = [{ id: 1, nombre: 'ROLE_USER' }
      // ,{id: 2, nombre: 'ROLE_ADMIN'}
    ];
    this.observ$ = this.authService.signup(usuario).pipe(
      takeUntil(this.unsubscribe$)
      /*      , catchError(err => {
               console.log('Se muestra el error y se vuelve a lanzar con throwError(err)', err);
               return throwError(err);
            }) */
    ).subscribe(
      response => {
        this.modalService.eventoCerrarModalScrollable.emit();
        swal.fire('Registro realizdo', 'Se envió un email para activar la cuenta, por favor, revise la bandeja de spam', 'success');
      },
      err => {
        this.showErrorService.httpErrorResponse(err, 'Error al registrar usuario', err.error.mensaje, 'error');
      }
    );
    return;
  }

  ngOnDestroy(): void {
    this.location.back();
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
