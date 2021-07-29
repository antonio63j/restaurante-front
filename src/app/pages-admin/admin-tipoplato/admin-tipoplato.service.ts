import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Tipoplato } from '../../shared/modelos/tipoplato';

@Injectable({
  providedIn: 'root'
})
export class AdminTipoplatoService implements OnDestroy {

  constructor(private http: HttpClient,
    //  public authService: AuthService
  ) { }

  getTipoplatos(): Observable<any> {
    return this.http.get<Tipoplato[]>(environment.urlEndPoint + '/api/tipoplato/list').pipe(
      tap((response: any) => {
      }),
      map((response: any) => {
        (response as Tipoplato[]).map(sli => {
          return sli;
        });
        return response;
      })
    );
  }

  create(tipoplato: Tipoplato): Observable<any> {
    /* se añade el token con TokenInterceptor
    return this.http.post<any>(this.urlEndPoint, tipoplato, { headers: this.httpHeader }); */
    tipoplato.id = null;
    return this.http.post<Tipoplato>(environment.urlEndPoint + '/api/tipoplato/create', tipoplato).pipe(
      catchError(err => {
        console.log(`error capturado en create tipoplato: ${err.error.error} `);
        return throwError(err);
      })
    );
  }

  update(tipoplato: Tipoplato): Observable<any> {
    return this.http.put(environment.urlEndPoint + '/api/tipoplato/update', tipoplato).pipe(
      catchError(err => {
        console.log(`error al actualizar datos del tipoplato: ${err.message} `);
        return throwError(err);
      })
      // , map((response: any) => response.tipoplato as tipoplato)
    );
  }

  delete(id: number): Observable<Tipoplato> {
    return this.http.delete<Tipoplato>(`${environment.urlEndPoint}/api/tipoplato/${id}`).pipe(
      catchError(err => {
        console.error(`error al eliminar el tipo de plato: ${err.status} `);
        console.error(`error al eliminar el tipo de plato: ${err.message} `);
        return throwError(err);
      }));
  }

  ngOnDestroy(): void {
    console.log('Tipoplatoservice.ngOnDestroy ()');
  }
}
