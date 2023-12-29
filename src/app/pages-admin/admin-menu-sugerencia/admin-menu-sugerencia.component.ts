import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { isPlatformBrowser, Location } from '@angular/common';
import { FiltroSugerencia, OrdenMenuSugerencia } from 'src/app/shared/modelos/filtro-sugerencia';
import { Menu } from 'src/app/shared/modelos/menu';
import { MenuSugerencia } from 'src/app/shared/modelos/menu-sugerencia';
import { Sugerencia } from 'src/app/shared/modelos/sugerencia';
import { Tipoplato } from 'src/app/shared/modelos/tipoplato';
import { AuthService } from 'src/app/usuarios/auth.service';
import { environment } from 'src/environments/environment';
import { LowerCasePipe } from '@angular/common';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';

import { AdminMenuService } from '../admin-menu/admin-menu.service';
import { AdminSugerenciaService } from '../admin-sugerencia/admin-sugerencia.service';
import { ShareEmpresaService } from 'src/app/shared/services/share-empresa.service';
import { ComponenteMenu } from 'src/app/shared/modelos/componente-menu.enum';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-admin-menu-sugerencia',
  templateUrl: './admin-menu-sugerencia.component.html',
  styleUrls: ['./admin-menu-sugerencia.component.scss']
})

export class AdminMenuSugerenciaComponent implements OnInit, OnDestroy {

  private subscriptionParams$: Subscription = null;
  private unsubscribe$ = new Subject<void>();

  host: string = environment.urlEndPoint;

  // atributos para tabla de menu
  public ordenMenuSugerencia: OrdenMenuSugerencia = new OrdenMenuSugerencia();
  public menu: Menu;

  public disableMS = false;
  public invisibleMS = false;

  // atributos para tabla de configuracion de menu
  public paginador: any;
  sugerencias: Sugerencia[];
  sugerencia: Sugerencia = new Sugerencia();
  public tipoPlatos: Tipoplato[];

  public disable = false;

  // public componenteMenu: string;
  public componenteMenu: ComponenteMenu;

  public filterChecked = false;
  public filtroSugerencia: FiltroSugerencia = new FiltroSugerencia();

  constructor(
    private location: Location,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private menuService: AdminMenuService,
    private sugerenciaService: AdminSugerenciaService,
    private shareEmpresaService: ShareEmpresaService,
    private showErrorService: ShowErrorService,
    @Inject(PLATFORM_ID) private platformId: string


  ) {
    this.tipoPlatos = this.shareEmpresaService.getIipoplatosInMem();

    this.componenteMenu = ComponenteMenu.primero;
  }

  ngOnInit(): void {
    this.subscripcionGestionParams();
  }

  subscripcionGestionParams(): void {
    this.subscriptionParams$ = this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(params => this.gestionParams(params));
  }

  gestionParams(params: any): void {
    const menuId = params.id;
    this.getMenu(menuId);
  }

  // procedimientos para tabla del menu
  // +++++++++++++++++++++++++++++++++++++++++++++
  getMenu(menuId: number): void {
    this.menuService.getMenu(menuId)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((response: any) => {
          // console.log(response);
        })
      )
      .subscribe(
        response => {
          this.menu = response.data as Menu;
        },
        err => {this.showErrorService.httpErrorResponse(err, 'Error en carga sugerencias', '', 'error');
        }
      );
  }

  public configurarMenu(componenteMenu: ComponenteMenu): void {
    // tabla menu pasa a invisible
    // tabla configuracion menu pasa a visible
    // carga de tabla menu configuracion
    this.disableMS = true;
    this.disable = false;
    this.componenteMenu = componenteMenu;
    this.inicioSeleccionSugerencias();

  }

  public deleteMenuSugerencia(menuSugerencia: MenuSugerencia): void {
    swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la sugerencia ${menuSugerencia.sugerencia.label}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.menuService.deleteMenuSugerencia(menuSugerencia.id).subscribe(
          response => {
            this.getMenu(this.menu.id);
          }
          , err => {this.showErrorService.httpErrorResponse(err, 'Error eliminando menu-sugerencia', '', 'error');
          }
        );
      }
    });
  }


  public salir(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.location.back();
    }
  }

  public sortChangeColumnMS(colName: string): void {
    if (colName === this.ordenMenuSugerencia.order) {
      if (this.ordenMenuSugerencia.direction === 'asc') {
        this.ordenMenuSugerencia.direction = 'desc';
      }
      else {
        this.ordenMenuSugerencia.direction = 'asc';
      }
    } else {
      this.ordenMenuSugerencia.order = colName;
      this.ordenMenuSugerencia.direction = 'asc';
    }
    this.sortColumnMS();
  }

  sortColumnMS(): void {


    if (this.ordenMenuSugerencia.order === 'label') {
      if (this.ordenMenuSugerencia.direction === 'asc') {
        this.menu.menuSugerencias.sort((a, b) =>
          (a.sugerencia.label > b.sugerencia.label) ? 1 : -1);
      } else {
        this.menu.menuSugerencias.sort((a, b) =>
          (a.sugerencia.label < b.sugerencia.label) ? 1 : -1);
      }
    } else {
      if (this.ordenMenuSugerencia.direction === 'asc') {
        this.menu.menuSugerencias.sort((a, b) =>
          (a.componenteMenu > b.componenteMenu) ? 1 : -1);
      } else {
        this.menu.menuSugerencias.sort((a, b) =>
          (a.componenteMenu < b.componenteMenu) ? 1 : -1);
      }
    }

  }


  // procedimientos para tabla configuracion menus
  // +++++++++++++++++++++++++++++++++++++++++++++
  changedFilter(): void {
    if (this.filterChecked) {
      this.nuevaPagina(0);
    } else {
      this.filtroSugerencia.init();
      this.nuevaPagina(0);
    }
  }

  quitarFiltros(): void {
    this.filtroSugerencia.init();
    this.filterChecked = !this.filterChecked;
    this.nuevaPagina(0);
  }

  inicioSeleccionSugerencias(): void {
    this.sugerencias = [];
    this.filtroSugerencia.init();
    this.filterChecked = false;
    this.nuevaPagina(0);
  }

  public sortChangeColumn(colName: string): void {
    if (colName === this.filtroSugerencia.order) {
      if (this.filtroSugerencia.direction === 'asc') {
        this.filtroSugerencia.direction = 'desc';
      }
      else {
        this.filtroSugerencia.direction = 'asc';
      }
    } else {
      this.filtroSugerencia.order = colName;
      this.filtroSugerencia.direction = 'asc';
    }
    this.nuevaPagina(0);
  }

  // Es llamado por el paginator
  public getPagina(paginaYSize: any): void {
    const pagina: number = paginaYSize.pagina;
    const size: number = paginaYSize.size;
    this.filtroSugerencia.size = size.toString();
    this.nuevaPagina(pagina);
  }

  nuevaPagina(pagina: number): void {
    this.filtroSugerencia.page = pagina.toString();

    if (!this.filterChecked) {
      this.filtroSugerencia.init();
    }

    this.sugerenciaService
      .getSugerencias(this.filtroSugerencia)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((response: any) => {
          // console.log(response);
        })
      )
      .subscribe(
        response => {
          this.sugerencias = response.content as Sugerencia[];
          this.paginador = response;
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
          }
        },
        err => {this.showErrorService.httpErrorResponse(err, 'Error carga sugerencias', '', 'error');
        }
      );
  }

  public addMenuSugerencia(sugerencia: Sugerencia): void {
    // let primerPlato = true;
    // if (this.componenteMenu === 'segundos') {
    //   primerPlato = false;
    // }

    if (sugerencia.visible === 'no') {
      swal.fire('La sugerencia está configurada a "no visible"', '', 'warning');
      return;
    }
    this.menuService.addMenuSugerencia(
      // this.menu, sugerencia.id, primerPlato)
      this.menu, sugerencia.id, this.componenteMenu)

      .pipe(
        takeUntil(this.unsubscribe$),
        tap((response: any) => {
          // console.log(response);
        })
      )
      .subscribe(
        response => {
          this.menu = response.data as Menu;
          this.sortColumnMS();
        },
        err => {this.showErrorService.httpErrorResponse(err, 'Error al añadir sugerencia', '', 'error');
        }
      );
  }

  salirSeleccion(): void {
    this.disable = true;
    this.disableMS = false;
  }

  // procedimientos comunes
  // +++++++++++++++++++++++++++++++++++++++++++++

  ngOnDestroy(): void {
    console.log('realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

  }

}
