
    /*

    A tener en cuenta:
    - Puede haber varias sesiones del mismo usuario actualizando el carrito.
      la DB mantiene el carrito actualizado únicamente con la última acción realizada
      desde cualquiera de las sesiones. Podemos decir que un update, borrar el carrito
      anterior y crea uno nuevo.
    - Gestion en servidor web para establcer que diferentes sesiones simultáneas con el
      mismo usuario, tengan el mismo id de pedido:
      Cuando le llega al servidor web una peticion de actualización del carrito con
      carrito.id = null, busca en la tabla de pedidos, utilizando cód. de usuario y
      estado=CREACION, y si existe, asigna a la peticion de actualización el id obtenido
      en la tabla.

    Nomenclatura:
    - Carrito-component.carrito, carrito-component.carritoCheck, carrito-service.carrito.
    - Carrito-component tiene su propio carrito (carrito-component.carrito, que está
      asociado al template html) y actualiza carrito-component.carritoCheck con las
      respuestas de component-service para gesti¢n de chequeo de precios.
    - Carta-component y men£-component utilizan el carrito-service para incluir art¡culos
      en el carrito (carrito-service.carrito).
    - Carrito-component utiliza carrito-service para eliminar art¡culos, cambiar cantidades
      y confirmar carrito.

    Cuando se actualiza el carrito-service.carrito con la DB:
    - Con el login
    - Con el propio arranque del servidor
    - Con el arranque de componente principal? (main.app). Comprobar si necesario

    El objetivo principal de "controlCambioPrecio"‚ es detectar cambios en los precios
    mientras el usuario está en carrito.component. Para ello se trabaja con
    carrito.component.carrito y con carrito.service.carrito o carritoCheck.

    Los cambios en los precios sólo se mostrarán en carrito.component:
    1. Gestión al entrar en carrito.component:
       Al entrar en carrito.component, se inicializa carrito-componet.carrito
       con carrito-service.carrito (copia). Para inicializar carrito-component.carritoCheck,
       se hace subscripcion a carrito-service para sincronizarse con DB.
    - Un art¡culo que est  en carritoCheck y no en carrito-component.carrrito:
      Se a¤ade
    - Un artículo que está en carritoCheck y component-carrito.carrito:
      se comprueba posible cambio de precio
    - Un artículo que no está en carritoCheck y sí en component-carrito.carrito:
      Se mantiene, con lo que se podrá confirmar el carrito con este articulo.
      Si se solicita eliminar el articulo, se elimina solo en memoria (carrito-component.carrito)

    2. Gestión con las acciones de usuario dentro de carrito-component
    - Eliminar un artíulo.
      Si el articulo no está en carrito-component.carritoCheck, se elimina del
      array component-carrito.carrito. En el caso de existir en carritoCheck,
      se solicita la eliminación al servidor web.
    - Cambio en la cantidad de un artículo.
      Esté o no el artículo en carrito-component.carritoCheck, se envía la petición al
      servidor web.
    - Entrada en tramitar.
      No se act£a sobre DB
    - Confirmación del pedido.
      Con esta petición el servidor web chequea si ha cambiado algún precio y en ese caso,
      actualiza DB y puede devolver el carrito ya con los precios actualizados, si no ha
      cambiado ningún precio, actualiza DB pasando a CONFIRMADO y devuelve null en lugar de
      carrito actualizado.
*/

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Pedido, PedidoLineaSugerencia, CantidadesOpciones, PedidoLineaMenu } from 'src/app/shared/modelos/pedido';
import { environment } from 'src/environments/environment';
import { CarritoService } from './carrito.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import swal from 'sweetalert2';

import { Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/usuarios/auth.service';
import { PedidoConfirmacion } from 'src/app/shared/modelos/pedido-confirmacion';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';
registerLocaleData(localeEs, 'es');


@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit, OnDestroy {

  carrito: Pedido;
  carritoCheck: Pedido;

  host: string = environment.urlEndPoint;
  public erroresValidacion: string[];
  public observ$: Subscription = null;
  public observSugerencia$: Subscription = null;
  public observMenu$: Subscription = null;

  private unsubscribe$ = new Subject<void>();
  public cantidades: number[] = CantidadesOpciones.cantidades;

  private preciosModificados: any[];

  constructor(
    public carritoService: CarritoService,
    private authService: AuthService,
    private showErrorService: ShowErrorService
  ) {
    this.carrito = this.carritoService.copiaCarrito();
    this.subscripcionCarritoCheck();
  }

  ngOnInit(): void {

  }

  tramitar(pedidoConfirmacion: PedidoConfirmacion): void {
    this.carrito.nota = pedidoConfirmacion.nota;
    this.carrito.fechaEntrega = pedidoConfirmacion.
       fechaEntrega.toLocaleString();
    const now = new Date();
    this.carrito.fechaRegistro = now.toLocaleString();
    this.carrito.direccion = pedidoConfirmacion.direccion;
    this.carrito.entregaPedido = pedidoConfirmacion.entregaPedido;

    this.observ$ = this.carritoService.confirmar(this.carrito).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
            this.carrito.id = undefined;
          } else {
            // this.carrito = response.data;
            this.carritoCheck = response.data;
            this.controlCambioPrecio();

            swal.fire('Actualizado precio de alguno de los articulos', 'Por favor, revise carrito y vuelva a Confirmar', 'warning');

          }
          // this.carritoService.sendNumArticulosCarritoMsg(this.carrito.numArticulos);
        },
        err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al añadir en carrito', '', 'error');
          }
        }
      );
  }

  subscripcionCarritoCheck(): void {
    this.carritoService.get().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      response => {
        if (response == null) {
          this.carritoService.inicializaCarrito(this.carrito);
        } else {
          this.carritoCheck = response.data;
          this.controlCambioPrecio();
        }
      }, err => {this.showErrorService.httpErrorResponse(err, 'Carga articulos del carrito', '', 'error');
      }
    );
  }

  private getLineaSugerencia(arr: PedidoLineaSugerencia[], id: number): PedidoLineaSugerencia {
    return arr.find(x => x.sugerencia.id === id);
  }

  private getLineaSugerenciaIndex(arr: PedidoLineaSugerencia[], elemento: PedidoLineaSugerencia): number {
    // devuele -1 como findIndex() si no se encuentra
    return arr.findIndex(item => item.sugerencia.id === elemento.sugerencia.id);
  }

  private getLineaMenu(arr: PedidoLineaMenu[], id: number): PedidoLineaMenu {
    return arr.find(x => x.menu.id === id);
  }

  private getLineaMenuIndex(arr: PedidoLineaMenu[], elemento: PedidoLineaMenu): number {
    // devuele -1 como findIndex() si no se encuentra
    return arr.findIndex(item => item.menu.id === elemento.menu.id);
  }

  controlCambioPrecio(eliminando: boolean = false): void {

    let lineaSug: PedidoLineaSugerencia;
    let lineaMen: PedidoLineaMenu;
    let lineasAdd = 0;

    this.preciosModificados = [];

    for (const lSugx of this.carrito.pedidoLineaSugerencias) {
      lineaSug = this.getLineaSugerencia(this.carritoCheck.pedidoLineaSugerencias, lSugx.sugerencia.id);
      if (lineaSug === undefined) {
        if (eliminando) {
          this.carrito.pedidoLineaSugerencias.splice(
            this.getLineaSugerenciaIndex(this.carrito.pedidoLineaSugerencias, lSugx), 1);
        } else {
        }
      } else {
        // ver for .. of de carritoCheck
      }
    }

    for (const lMenx of this.carrito.pedidoLineaMenus) {
      lineaMen = this.getLineaMenu(this.carritoCheck.pedidoLineaMenus, lMenx.menu.id);
      if (lineaMen === undefined) {
        if (eliminando) {
          this.carrito.pedidoLineaMenus.splice(
            this.getLineaMenuIndex(this.carrito.pedidoLineaMenus, lMenx), 1);
        } else {
        }
      }
    }

    for (const lSugx of this.carritoCheck.pedidoLineaSugerencias) {
      lineaSug = this.getLineaSugerencia(this.carrito.pedidoLineaSugerencias, lSugx.sugerencia.id);
      if (lineaSug !== undefined) {
        if (lineaSug.precioInicio !== lSugx.sugerencia.precio) {
          this.preciosModificados.push({
            producto: lineaSug.sugerencia.label,
            precioAnterior: lineaSug.precioInicio,
            precioNuevo: lSugx.sugerencia.precio
          });
          // lineaSug.sugerencia.precioAnterior = lineaSug.sugerencia.precio;
          lineaSug.sugerencia.precio = lSugx.sugerencia.precio;
        }
      } else {
        this.carrito.pedidoLineaSugerencias.push(lSugx);
        ++lineasAdd;
      }
    }

    for (const lMenx of this.carritoCheck.pedidoLineaMenus) {
      lineaMen = this.getLineaMenu(this.carrito.pedidoLineaMenus, lMenx.menu.id);
      if (lineaMen !== undefined) {
        if (lineaMen.precioInicio !== lMenx.menu.precio) {
          this.preciosModificados.push({
            producto: lineaMen.menu.label,
            precioAnterior: lineaMen.precioInicio,
            precioNuevo: lMenx.menu.precio
          });
          // lineaMen.menu.precioAnterior = lineaMen.menu.precio;
          lineaMen.menu.precio = lMenx.menu.precio;
        }
      } else {
        this.carrito.pedidoLineaMenus.push(lMenx);
        ++lineasAdd;
      }
    }

    if (lineasAdd > 0) {this.carritoService.sortCarrito(this.carrito);
    }

    if (this.preciosModificados.length > 0) {
      console.log(`carrito Modificado: ${JSON.stringify(this.preciosModificados)}`);
    }

    this.carritoService.calculosCarrito(this.carrito);

  }

  cambioCantidadSugerencia(pedidoLineaSugerencia: PedidoLineaSugerencia): void {
    this.observSugerencia$ = this.carritoService.saveLineaSugerencia(pedidoLineaSugerencia).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
          } else {
            this.carritoCheck = response.data;
            this.controlCambioPrecio();
          }
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al actualizar carrito', '', 'error');
          }
        }
      );
  }

  cambioCantidadMenu(pedidoLineaMenu: PedidoLineaMenu): void {
    this.observMenu$ = this.carritoService.saveLineaMenu(pedidoLineaMenu).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
          } else {
            this.carritoCheck = response.data;
            this.controlCambioPrecio();
          }
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al actualizar carrito', '', 'error');
          }
        }
      );
  }

  deleteLineaSugerencia(lineaSugerencia: PedidoLineaSugerencia): void {

    const index = this.getLineaSugerenciaIndex(this.carritoCheck.pedidoLineaSugerencias, lineaSugerencia);

    if (index < 0) {
      this.carrito.pedidoLineaSugerencias.splice(
        this.getLineaSugerenciaIndex(this.carrito.pedidoLineaSugerencias, lineaSugerencia), 1);
      this.carritoService.calculosCarrito(this.carrito);
      return;
    }
    this.erroresValidacion = [];
    this.observ$ = this.carritoService.deleteLineaSugerencia(this.carrito.id, lineaSugerencia.id).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
            this.carritoCheck.pedidoLineaSugerencias = [];
          } else {
            this.carritoCheck = response.data;
            this.controlCambioPrecio(true);
          }
          //  this.carritoService.sendNumArticulosCarritoMsg(this.carrito.numArticulos);
        },
        err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error al eliminar articulo de carrito', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al eliminar articulo del carrito', '', 'error');
          }
        }
      );

  }

  deleteLineaMenu(lineaMenu: PedidoLineaMenu): void {
    this.erroresValidacion = [];
    this.observ$ = this.carritoService.deleteLineaMenu(this.carrito.id, lineaMenu.id).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
            this.carritoCheck.pedidoLineaMenus = [];
          } else {
            this.carritoCheck = response.data;
            this.controlCambioPrecio(true);
          }
          // this.carritoService.sendNumArticulosCarritoMsg(this.carrito.numArticulos);
        },
        err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al actualizar carrito', '', 'error');
          }
        }
      );

  }

  save(): void {
    this.erroresValidacion = [];
    this.observ$ = this.carritoService.save(this.carrito).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        response => {
          if (response == null) {
            this.carritoService.inicializaCarrito(this.carrito);
          } else {
            this.carrito = response.data;
          }
          // this.carritoService.sendNumArticulosCarritoMsg(this.carrito.numArticulos);
        },
        err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al actualizar carrito', '', 'error');
          }
        }
      );
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.observMenu$ != null && !this.observMenu$.closed) {
      console.log('haciendo : this.observMenu$.unsubscribe()');
      this.observMenu$.unsubscribe();
    } else {
      console.log('No necesario hacer: this.observMenu$.unsubscribe()');
    }

    if (this.observSugerencia$ != null && !this.observSugerencia$.closed) {
      console.log('haciendo : this.observSugerencia$.unsubscribe()');
      this.observSugerencia$.unsubscribe();
    } else {
      console.log('No necesario hacer: this.observSugerencia$.unsubscribe()');
    }
  }

}
