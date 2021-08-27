import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Usuario } from 'src/app/shared/modelos/usuario';

import { Location } from '@angular/common';

import swal from 'sweetalert2';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';
import { AuthService } from 'src/app/usuarios/auth.service';
import { EmailContactoCliente } from 'src/app/shared/modelos/mensajes/email-contacto-cliente';
import { ContactoService } from './contacto.service';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss']
})
export class ContactoComponent implements OnInit {

  usuario: Usuario;
  public erroresValidacion: string[];
  private index: number;

  emailContactoCliente: EmailContactoCliente = new EmailContactoCliente();
  private observ$: Subscription = null;
  private observ1$: Subscription = null;
  private observ2$: Subscription = null;
  private unsubscribe$ = new Subject();

  constructor(
    private contactoService: ContactoService,
    public  authService: AuthService,
    private location: Location,
    private showErrorService: ShowErrorService

  ) {
    
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.usuario = this.authService.usuario;
      this.emailContactoCliente.nombre = this.usuario.nombre;
      this.emailContactoCliente.email = this.usuario.username;
    } else {
      }
    window.scrollTo(0, 0);
  }

  enviar(emailContactoCliente: EmailContactoCliente): void {
      this.erroresValidacion = [];
      this.observ1$ = this.contactoService.emailCliente(emailContactoCliente).pipe(
        takeUntil(this.unsubscribe$)
      )
        .subscribe(
          json => {
            swal.fire('Resultado: ', `${json.mensaje}`, 'success');
          }
          , err => {
            if (err.status === 400) {
              this.erroresValidacion = err.error.errors as string[];
              console.log(this.erroresValidacion);
            } else {
                this.showErrorService.httpErrorResponse(err, 'Envio de mensaje', err.error.mensaje, 'error');
            }
          }
        );
    }

  salir(): void {
    this.location.back();
  }

}
