import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../shared/modelos/usuario';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable()

export class AuthService {

  private _usuario: Usuario;
  private _token: string;

  constructor(private http: HttpClient) { }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (this._usuario == null && sessionStorage.getItem('usuario')) {
        return JSON.parse(sessionStorage.getItem('usuario')) as Usuario;
    }
    return new Usuario();
  }

  public get token(): string {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem('token')) {
        return sessionStorage.getItem('token');
    }
    return null;
  }

  public login(usuario: Usuario): Observable<any> {
    const urlEndpoint =  environment.urlEndPoint + '/oauth/token';
    const credenciales = btoa('angularapp' + ':' + '12345');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });
    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    return this.http.post<any>(urlEndpoint, params.toString(), { headers: httpHeaders});
  }

  public signup(usuario: Usuario): Observable<any> {
    return this.http.post<any>(environment.urlEndPoint + '/api/usuario/registro', usuario).pipe(
      catchError(err => {
        console.log(`error capturado: ${err.status} `);
        return throwError (err);
      })
    );
  }

  public guardarUsuario(accessToken: string): void {
    const payload = this.obtenerDatosToken (accessToken);
    this._usuario = new Usuario();
    this._usuario.nombre = payload.nombre_usuario;
    this._usuario.apellidos = payload.apellidos_usuario;
    // this._usuario.email = payload.email_usuario;
    this._usuario.username = payload.user_name;
    this._usuario.roles = payload.authorities;
    sessionStorage.setItem ('usuario', JSON.stringify(this._usuario));
   }

  public guardarToken(accessToken: string): void {
    sessionStorage.setItem ('token', accessToken);
  }

  public obtenerDatosToken(accessToken: string): any {
    if (accessToken == null) {
      return null;
    }
    return JSON.parse(atob(accessToken.split('.') [1]));
  }

  public isAuthenticated(): boolean {
    const payload = this.obtenerDatosToken (this.token);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

  public logout(): void {
    this._usuario = null;
    this._token = null;
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    // tambien  sessionStorage.clear;
  }

  public hasRole(role: string): boolean {
     if (this.usuario.roles.includes(role)) {
       return true;
     }
     return false;
  }

  resetPwd(usuario: Usuario): Observable<any> {
     return this.http.put<Usuario>(environment.urlEndPoint + '/api/usuario/resetpwd', usuario).pipe(
          catchError(err => {
            console.log(`error capturado: ${err.status} `);
            return throwError (err);
          })
      );
  }

  actualizarPwd(usuario: Usuario): Observable<any> {
    return this.http.put<Usuario>(environment.urlEndPoint + '/api/usuario/changepwd', usuario).pipe(
         catchError(err => {
           console.log(`error capturado: ${err.status} `);
           return throwError (err);
         })
     );
 }

 actualizarPerfil(usuario: Usuario): Observable<any> {
  return this.http.put<Usuario>(environment.urlEndPoint + '/api/usuario/update', usuario).pipe(
       catchError(err => {
         console.log(`error capturado: ${err.status} `);
         return throwError (err);
       })
   );
}

}
