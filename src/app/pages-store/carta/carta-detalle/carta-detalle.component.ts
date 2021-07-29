import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import swal from 'sweetalert2';

import { Sugerencia } from 'src/app/shared/modelos/sugerencia';
import { environment } from 'src/environments/environment';
import { ComponenteMenu } from 'src/app/shared/modelos/componente-menu.enum';
import { AuthService } from 'src/app/usuarios/auth.service';
import { CarritoService } from '../../../pages-store/carrito/carrito.service';
import { PedidoLineaSugerencia, CantidadesOpciones, Pedido } from 'src/app/shared/modelos/pedido';

@Component({
  selector: 'app-carta-detalle',
  templateUrl: './carta-detalle.component.html',
  styleUrls: ['./carta-detalle.component.scss']
})
export class CartaDetalleComponent implements OnInit {
  host: string = environment.urlEndPoint;
  public sugerencia: Sugerencia;
  public cantidad = 1;

  private carrito: Pedido;
  public cantidades: number[] = CantidadesOpciones.cantidades;
  public cantidadMax = this.cantidades.length;

  constructor(
    public activeModal: NgbActiveModal,
    public authService: AuthService,
    public carritoService: CarritoService
  ) {

  }


  aceptar(sugerencia: Sugerencia): void {

    if (this.cantidad < 1 || this.cantidad > this.cantidadMax) {
      swal.fire('Aviso', `Cantidad deber estar entre 1 y ${this.cantidadMax}`, 'warning');
    } else {
      const pedidoLineaSugerencia: PedidoLineaSugerencia = new PedidoLineaSugerencia();
      pedidoLineaSugerencia.sugerencia = sugerencia;
      pedidoLineaSugerencia.cantidad = this.cantidad;
      pedidoLineaSugerencia.precioInicio = sugerencia.precio;
      this.carritoService.addPedidoLineaSugerencia(pedidoLineaSugerencia);
      this.activeModal.close('con accept');
    }

  }

  cambioCantidad(): void {
  }

  ngOnInit(): void {
  }

}

