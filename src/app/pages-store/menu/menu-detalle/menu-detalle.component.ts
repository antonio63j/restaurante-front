import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import swal from 'sweetalert2';

import { Menu } from 'src/app/shared/modelos/menu';
import { MenuSugerencia } from 'src/app/shared/modelos/menu-sugerencia';
import { environment } from 'src/environments/environment';
import { ComponenteMenu } from 'src/app/shared/modelos/componente-menu.enum';
import { AuthService } from 'src/app/usuarios/auth.service';
import { CarritoService } from '../../carrito/carrito.service';
import { CantidadesOpciones, PedidoLineaMenu } from 'src/app/shared/modelos/pedido';
import { Sugerencia } from 'src/app/shared/modelos/sugerencia';


@Component({
  selector: 'app-menu-detalle',
  templateUrl: './menu-detalle.component.html',
  styleUrls: ['./menu-detalle.component.scss']
})

export class MenuDetalleComponent implements OnInit {
  host: string = environment.urlEndPoint;
  public menu: Menu;
  public cantidad = 1;

  public cantidades: number[] = CantidadesOpciones.cantidades;

  public cantidadMax = this.cantidades.length;

  primeros: MenuSugerencia[] = [];
  segundos: MenuSugerencia[] = [];
  postres: MenuSugerencia[] = [];

  // primero: MenuSugerencia;
  // segundo: MenuSugerencia;
  // postre: MenuSugerencia;

  primero: Sugerencia;
  segundo: Sugerencia;
  postre: Sugerencia;

  constructor(
    public activeModal: NgbActiveModal,
    public authService: AuthService,
    public carritoService: CarritoService
  ) {

   }


  aceptar(menu: Menu): void {
    if (this.primero === undefined ||
        this.segundo === undefined ||
        this.postre === undefined ) {
      swal.fire('Aviso', 'Falta opción por seleccionar', 'warning');
    } else {
        if (this.cantidad < 1 || this.cantidad > 20) {
          swal.fire('Aviso', `Cantidad deber estar entre 1 y ${this.cantidadMax}`, 'warning');
        } else {
            const pedidoLineaMenu: PedidoLineaMenu = new PedidoLineaMenu();
            pedidoLineaMenu.cantidad = this.cantidad;
            pedidoLineaMenu.precioInicio = menu.precio;

            pedidoLineaMenu.menu = this.menu;
            pedidoLineaMenu.primero = this.primero;
            pedidoLineaMenu.segundo = this.segundo;
            pedidoLineaMenu.postre = this.postre;

            console.log(`pedidoLinaMenu: ${JSON.stringify(pedidoLineaMenu)}`);

            this.carritoService.addPedidoLineaMenu(pedidoLineaMenu);
            this.activeModal.close('con accept');
        }
    }
  }

  cambioCantidad(): void {
  }

  ngOnInit(): void {
      this.primeros = this.menu.menuSugerencias.filter(element => {
        return element.componenteMenu === ComponenteMenu.primero;
      });
      this.segundos = this.menu.menuSugerencias.filter(element => {
        return element.componenteMenu === ComponenteMenu.segundo;
      });
      this.postres = this.menu.menuSugerencias.filter(element => {
        return element.componenteMenu === ComponenteMenu.postre;
      });
  }

}
