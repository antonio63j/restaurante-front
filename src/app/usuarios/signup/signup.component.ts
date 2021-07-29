import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Usuario } from '../../shared/modelos/usuario';
import { ModalConModeloService } from '../../shared/services/modal-con-modelo.service';
import { ModalService } from '../../shared/services/modal.service';
import { AuthService } from '../auth.service';
import { SignupModalComponent } from './signup-modal/signup-modal.component';
// import { Location } from '@angular/common';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    // styleUrls: ['./signup.component.scss'],
    // animations: [routerTransition()]
})
export class SignupComponent implements OnInit, OnDestroy {
    usuario: Usuario = new Usuario();
    private unsubscribe$ = new Subject();

    constructor(
      private router: Router,
      private modalService: ModalService,
      private modalConModeloService: ModalConModeloService,
      public authService: AuthService)
      // private location: Location)
      { }

    ngOnInit(): void {

        this.subscripcioneventoCerrarModalScrollable();
        this.crearModal();

    }

    crearModal(): void {
      this.usuario.username = null;
      this.usuario.password = null;

      this.modalConModeloService.openModalScrollable(
        SignupModalComponent,
        { size: 'lg', backdrop: 'static', scrollable: true },
        this.usuario,
        'usuario',
        'Los campos con * son obligatorios',
        'Login'
      ).pipe(
        take(1) // take() manages unsubscription for us
      ).subscribe(result => {
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

    ngOnDestroy(): void {
      console.log('realizando unsubscribes');
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }


