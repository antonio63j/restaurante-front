import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { from, Observable, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { AuthService } from 'src/app/usuarios/auth.service';
import { Pedido, PedidoLineaMenu, PedidoLineaSugerencia } from '../../shared/modelos/pedido';
import { Sugerencia } from '../../shared/modelos/sugerencia';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { EstadoPedidoEnum } from '../../shared/modelos/pedido';
import swal from 'sweetalert2';
import { LoginComponent } from 'src/app/usuarios/login/login.component';
import { LoadingComponent } from 'src/app/shared/componentes/loading/loading.component';
import { PedidoConfirmacion } from 'src/app/shared/modelos/pedido-confirmacion';
import { isTemplateExpression } from 'typescript';
// conversion angular 12 a 13 import { NullTemplateVisitor } from '@angular/compiler';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

// Este servicio deberá tener el carrito actualizado reflejando cambios de desde carta-component,
// menu-component y carrito-componet. Carrito-component deberá tener tambien tener una 
// copia actualizada, para ello debe hacer carga inicial del carrito y actualizaciones cuando
// realice actualizaciones o deletes de PedidoLineaSugerencia o PedidoLineaMenu.

// Con la finalización con éxisto de login, se solicita carga de carrito (cargaCarrito)
// con la finalidad de que se mande mensaje a los subcriptores del
// numero de articulos en carrito

@Injectable({
  providedIn: 'root'
})
export class CarritoService implements OnDestroy {
  public carrito: Pedido;
  public erroresValidacion: string[];
  public observ$: Subscription = null;
  private unsubscribe$ = new Subject<void>();

  private numArticulosCarritoMsg = new ReplaySubject<number>();

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private showErrorService: ShowErrorService

  ) {

    this.carrito = new Pedido(this.authService.usuario.username);
    this.inicializaCarrito(this.carrito);

    this.cargaCarrito();
  }

  public inicializaCarrito(carrito: Pedido): void {
    carrito.id = undefined;
    carrito.estadoPedido = EstadoPedidoEnum.creacion;
    carrito.total = 0;
    carrito.numArticulos = 0;
    const now = new Date();
    carrito.fechaRegistro = now.toLocaleString();
    carrito.pedidoLineaSugerencias = [];
    carrito.pedidoLineaMenus = [];

    console.log(`carrito: ${JSON.stringify(carrito)}`);

    // AFL
    console.log('fechaEntrega:' + carrito.fechaEntrega);
    console.log('fechaRegistro:' + carrito.fechaRegistro);

    this.sendNumArticulosCarritoMsg(carrito.numArticulos);

  }


  // devuelve observable para que HeaderComponer pueda subscribirse
  getNumArticulosCarritoMsg(): Observable<number> {
    return this.numArticulosCarritoMsg as Observable<number>;
  }

  sendNumArticulosCarritoMsg(numArticulos: number): void {
    console.log('publicando cambios del carrito');
    this.numArticulosCarritoMsg.next(numArticulos);
  }

  // clientes conocidos: carrito.component
  copiaCarrito(): Pedido {
    return this.carrito;
  }

  // llamado por:
  // - app.component con cada arranque de la app. y
  // - login-modal-component
  // - por este mismo servicio en el constructor
  // Tiene la funcion de actulizar el numero de articulos
  // que se muestran en header.component

  cargaCarrito(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.get()
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((response: any) => {
          // console.log(response);
        })
      )
      .subscribe(
        response => {
          if (response == null) {
            this.inicializaCarrito(this.carrito);
          } else {
            this.carrito = response.data;
          }
        },
        err => {this.showErrorService.httpErrorResponse(err, 'Error en carga del carrito', '', 'error');
        }
      );
  }

  // llamado desde carta-detalle.component->this.addPedidoLineaSugerencia
  private actualizarLineaSugerenciaEnCarrito(
    carrito: Pedido,
    pedidoLineaSugerencia: PedidoLineaSugerencia): void {

    let index: number;
    index = carrito.pedidoLineaSugerencias.findIndex(item => item.sugerencia.id === pedidoLineaSugerencia.sugerencia.id);
    if (index > -1) {
      carrito.pedidoLineaSugerencias[index] = pedidoLineaSugerencia;
    } else {
      carrito.pedidoLineaSugerencias.push(pedidoLineaSugerencia);
    }
  }

  // llamado desde menu-detalle.component->this.addPedidoLineaMenu
  private actualizarLineaMenuEnCarrito(
    carrito: Pedido,
    pedidoLineaMenu: PedidoLineaMenu): void {

    let index: number;
    index = carrito.pedidoLineaMenus.findIndex(
      item => item.menu.id === pedidoLineaMenu.menu.id &&
        item.primero.id === pedidoLineaMenu.primero.id &&
        item.segundo.id === pedidoLineaMenu.segundo.id &&
        item.postre.id === pedidoLineaMenu.postre.id);
    if (index > -1) {
      carrito.pedidoLineaMenus[index] = pedidoLineaMenu;
    } else {
      carrito.pedidoLineaMenus.push(pedidoLineaMenu);
    }
  }

  // llamado desde sugerencia-detalle.component
  addPedidoLineaSugerencia(pedidoLineaSugerencia: PedidoLineaSugerencia): void {
    this.actualizarLineaSugerenciaEnCarrito(this.carrito, pedidoLineaSugerencia);
    this.saveCarrito();
  }

  // llamado desde menu-detalle.component
  addPedidoLineaMenu(pedidoLineaMenu: PedidoLineaMenu): void {
    this.actualizarLineaMenuEnCarrito(this.carrito, pedidoLineaMenu);
    this.saveCarrito();
  }

  // LLamado desde this.addPedidoLineaSugerecia / .. menu
  saveCarrito(): void {
    this.erroresValidacion = [];
    this.carrito.usuario = this.authService.usuario.username;

    // console.log(`salvando carrito: ${JSON.stringify(this.carrito)}`);

    this.observ$ = this.save(this.carrito).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.carrito = json.data;
          this.calculosCarrito(this.carrito);
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
            swal.fire('Error en validación de datos ', `error.status = ${err.status.toString()}`, 'error');

          } else {this.showErrorService.httpErrorResponse(err, 'Error al guardar carrito', '', 'error');
          }
        }
      );
  }

  // llamado desde carrito-component debido a un cambio en cantidad
  saveLineaSugerencia(pedidoLineaSugerencia: PedidoLineaSugerencia): Observable<any> {
    this.actualizarLineaSugerenciaEnCarrito(this.carrito, pedidoLineaSugerencia);
    return this.save(this.carrito).pipe(
      catchError(err => {
        return throwError(err);
      })
    );
  }

  // llamado desde carrito-component debido a un cambio en cantidad
  saveLineaMenu(pedidoLineaMenu: PedidoLineaMenu): Observable<any> {
    this.actualizarLineaMenuEnCarrito(this.carrito, pedidoLineaMenu);
    return this.save(this.carrito).pipe(
      catchError(err => {
        return throwError(err);
      })
    );
  }

  sortCarrito(carrito: Pedido): void {
    (carrito.pedidoLineaSugerencias.sort((a, b) => {
      return a.sugerencia.label < b.sugerencia.label ? -1 : 1;
    }
    ));
    (carrito.pedidoLineaMenus.sort((a, b) => {
      return a.menu.label.localeCompare(b.menu.label) || b.id - a.id;
    }
    ));
  }

  save(carrito: Pedido): Observable<any> {
    // Ojo que no actualiza this.carrito con la peticion
    // lo actualiza con la respuesta

    return this.http.post<Pedido>(environment.urlEndPoint + '/api/carrito/save', carrito).pipe(
      catchError(err => {
        console.log(`error capturado: ${err.status} `);
        return throwError(err);
      }), map((response: any) => {
        if (response === null) {
          return response;
        }

        this.sortCarrito(response.data);
        this.carrito = response.data;

        // console.log(`carrito: ${JSON.stringify(this.carrito)}`);

        this.calculosCarrito(this.carrito);
        return response;

      })
    );
  }

  public calculosCarrito(carrito: Pedido): void {
    carrito.total = 0;
    carrito.numArticulos = 0;

    carrito.pedidoLineaSugerencias.forEach(element => {
      carrito.numArticulos = carrito.numArticulos + element.cantidad;
      carrito.total = carrito.total + (element.cantidad * element.sugerencia.precio);
    });

    carrito.pedidoLineaMenus.forEach(element => {
      carrito.numArticulos = carrito.numArticulos + element.cantidad;
      carrito.total = carrito.total + (element.cantidad * element.menu.precio);
    });

    this.sendNumArticulosCarritoMsg(carrito.numArticulos);

  }

  get(): Observable<any> {
    let parametros = new HttpParams();
    parametros = parametros.append('usuario', this.authService.usuario.username);

    return this.http.get<Pedido>(environment.urlEndPoint + '/api/carrito/usuario',
      { params: parametros }).pipe(
        catchError(err => {
          console.log(`error capturado: ${err.status} `);
          return throwError(err);
        }), tap((response: any) => {
        }
        )
        , map((response: any) => {
          if (response === null) {
            return response;
          }

          this.sortCarrito(response.data);
          this.carrito = response.data;
          this.calculosCarrito(this.carrito);
          return response;
        })
      );
  }

  deleteLineaSugerencia(idPedido: number, idLineaSugerencia: number): Observable<any> {
    let parametros = new HttpParams();
    parametros = parametros.append('idPedido', idPedido.toString());
    parametros = parametros.append('idLineaSugerencia', idLineaSugerencia.toString());

    return this.http.delete<Pedido>(environment.urlEndPoint + '/api/carrito/lineaSugerencia',
      { params: parametros }).pipe(
        catchError(err => {
          console.log(`error capturado: ${err.status} `);
          return throwError(err);
        }), map((response: any) => {
          if (response === null) {
            return response;
          }

          this.sortCarrito(response.data);
          this.carrito = response.data;
          this.calculosCarrito(this.carrito);
          return response;
        })
      );

  }

  deleteLineaMenu(idPedido: number, idLineaMenu: number): Observable<any> {
    let parametros = new HttpParams();
    parametros = parametros.append('idPedido', idPedido.toString());
    parametros = parametros.append('idLineaMenu', idLineaMenu.toString());

    return this.http.delete<Pedido>(environment.urlEndPoint + '/api/carrito/lineaMenu',
      { params: parametros }).pipe(
        catchError(err => {
          console.log(`error capturado: ${err.status} `);
          return throwError(err);
        }), map((response: any) => {
          if (response === null) {
            return response;
          }

          this.sortCarrito(response.data);
          this.carrito = response.data;
          this.calculosCarrito(this.carrito);
          return response;
        })
      );
  }

  public getTotal(): number {
    return this.carrito.total;
  }

  confirmar(carrito: Pedido): Observable<any> {

    console.log(`enviando confirmacion carrito: ${JSON.stringify(carrito)}`);
    return this.http.post<PedidoConfirmacion>(environment.urlEndPoint + '/api/carrito/confirmacion', carrito).pipe(
      catchError(err => {
        console.log(`error capturado: ${err.status} `);
        return throwError(err);
      }), map((response: any) => {

        if (response === null) {
          this.inicializaCarrito(this.carrito);
          return response;
        }

        this.sortCarrito(response.data);
        this.carrito = response.data;
        this.calculosCarrito(this.carrito);
        return response;

      })
    );
  }

  ngOnDestroy(): void {
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
