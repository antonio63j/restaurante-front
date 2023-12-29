import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ComponenteMenu } from 'src/app/shared/modelos/componente-menu.enum';
import { Menu } from 'src/app/shared/modelos/menu';
import { MenuSugerencia } from 'src/app/shared/modelos/menu-sugerencia';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminMenuService implements OnDestroy {

  constructor(private http: HttpClient) {

  }

  getMenu(id: number): Observable<any> {
    return this.http.get<Menu>(`${environment.urlEndPoint}/api/menu/${id}`).pipe(
      catchError(err => {
        console.error(`error lectura menu: ${err.status} `);
        console.error(`error lectura menu: ${err.message} `);
        return throwError(err);
      }));
  }

  getMenus(): Observable<any> {
    return this.http.get<Menu[]>(environment.urlEndPoint + '/api/menu/list').pipe(
      tap((response: any) => {
      }),
      map((response: any) => {
        (response as Menu[]).map(menu => {
          return menu;
        });
        return response;
      })
    );
  }

  getMenusVisibles(): Observable<any> {
    return this.http.get<Menu[]>(environment.urlEndPoint + '/api/menu/list-visible').pipe(
      tap((response: any) => {
        //  (response.content as menu[]).forEach (menu => console.log(menu));
      }),
      map((response: any) => {
        (response as Menu[]).map(menu => {
          return menu;
        });
        return response;
      })
    );
  }

  create(menu: Menu): Observable<any> {
    /* se añade el token con TokenInterceptor
    return this.http.post<any>(this.urlEndPoint, menu, { headers: this.httpHeader }); */
    menu.id = null;
    return this.http.post<Menu>(environment.urlEndPoint + '/api/menu/create', menu).pipe(
      catchError(err => {
        console.log(`error capturado en create: ${err.error.error} `);
        return throwError(err);
      })
    );
  }

  update(menu: Menu): Observable<any> {
    return this.http.put(environment.urlEndPoint + '/api/menu/update', menu).pipe(
      catchError(err => {
        console.log(`error al actualizar datos del menu: ${err.message} `);
        return throwError(err);
      })
      // , map((response: any) => response.menu as menu)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<Menu>(`${environment.urlEndPoint}/api/menu/${id}`).pipe(
      catchError(err => {
        console.error(`error al eliminar menu: ${err.status} `);
        console.error(`error al eliminar menu: ${err.message} `);
        return throwError(err);
      }));
  }

  addMenuSugerencia(
    menu: Menu,
    sugerenciaId: number,
    // primerPlato: boolean): Observable<any> {
    componenteMenu: ComponenteMenu): Observable<any> {
    const parametros = new HttpParams()
      .set('menuId', menu.id.toString())
      .set('sugerenciaId', sugerenciaId.toString())
      // .set('primerPlato', primerPlato.toString());
      .set('componenteMenu', componenteMenu);

    return this.http.post<any>(`${environment.urlEndPoint}/api/menusugerencia/create`, menu, { params: parametros }).pipe(
        catchError(err => {
          console.error(`error al añadir menu-sugerencia: ${err.status} `);
          console.error(`error al añadir menu-sugerencia: ${err.message} `);
          return throwError(err);
        })
      );
  }

  deleteMenuSugerencia(id: number): Observable<any> {
    return this.http.delete<MenuSugerencia>(`${environment.urlEndPoint}/api/menusugerencia/${id}`).pipe(
      catchError(err => {
        console.error(`error al eliminar menu-sugerencia: ${err.status} `);
        console.error(`error al eliminar menu-sugerencia: ${err.message} `);
        return throwError(err);
      })
    );
  }

  ngOnDestroy(): void {
    console.log('En ngOnDestroy ()');
  }
}

