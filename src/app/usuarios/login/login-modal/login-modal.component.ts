import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../auth.service';
import { Usuario } from '../../../shared/modelos/usuario';
import swal from 'sweetalert2';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../shared/services/modal.service';
import { Router } from '@angular/router';
import { CarritoService } from 'src/app/pages-store/carrito/carrito.service';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';


@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})

export class LoginModalComponent implements OnInit, OnDestroy {
  public usuario: Usuario = new Usuario();
  public titulo = 'Inicio de sesión';
  public hide = true;

  constructor(
    public authService: AuthService,
    public activeModal: NgbActiveModal,
    private modalService: ModalService,
    private location: Location,
    private router: Router,
    private carritoService: CarritoService,
    private showErrorService: ShowErrorService
  ) { }

  ngOnInit(): void {
  }

  login(): void {
    this.authService.login(this.usuario).subscribe(
      response => {
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        const usuario = this.authService.usuario;
        // console.log(`login con éxito de ${usuario.username}`);
        this.carritoService.cargaCarrito();

        this.modalService.eventoCerrarModalScrollable.emit();
      },
      err => {
        if (err.status === 400) {
          console.log(err);
          swal.fire('Error Login', 'Usuario o password incorrectas o cuenta no activada!', 'error');
        } else {this.showErrorService.httpErrorResponse(err, 'Error login', '', 'error');
        }
      }
    );
    return;
  }

  resetPassword(): void {
    // this.modalService.eventoCerrarModalScrollable.emit();
    this.activeModal.close('resetPassword');
  }

  signup(): void {
    this.activeModal.close('signup');
  }

  ngOnDestroy(): void {
    console.log('en ngOnDestroy()');
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.router.navigate(['\admin-index']);
    } else {
      this.location.back();
    }
  }
}
