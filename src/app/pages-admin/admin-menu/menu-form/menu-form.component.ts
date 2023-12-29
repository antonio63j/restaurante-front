import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import swal from 'sweetalert2';

import { Menu } from '../../../shared/modelos/menu';
import { ModalService } from '../../../shared/services/modal.service';
import { AdminMenuService } from '../admin-menu.service';
import { environment } from 'src/environments/environment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShareEmpresaService } from 'src/app/shared/services/share-empresa.service';
import { Tipoplato } from 'src/app/shared/modelos/tipoplato';
import { UntypedFormControl, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ShowErrorService } from 'src/app/shared/services/show-error.service';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.scss']
})

export class MenuFormComponent implements OnInit, OnDestroy {

  host: string = environment.urlEndPoint;
  public menu: Menu;
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject<void>();
  public erroresValidacion: string[];

  public tipoControl = new UntypedFormControl('', Validators.required);

  configDescripcion: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '110',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '110',
    translate: 'no',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Introducir descripción del menú',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    defaultFontSize: '3',
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'}
    ],
    toolbarHiddenButtons: [
      [
       'strikeThrough',
       'subscript',
       'superscript',
      ],
      [
       'link',
       'unlink',
       'insertImage',
       'insertVideo',
       'insertHorizontalRule',
      ]
    ],
    customClasses: [
    {
      name: 'quote',
      class: 'quote',
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'modalTitleText',
      class: 'modalTitleText',
      tag: 'h1',
    },
  ],
  uploadUrl: 'v1/image',
  sanitize: true,
  toolbarPosition: 'top',
  };



  constructor(
    private adminSugerenciaService: AdminMenuService,
    private shareEmpresaService: ShareEmpresaService,
    private modalService: ModalService,
    public activeModal: NgbActiveModal,
    private showErrorService: ShowErrorService
  ) {
  }

  ngOnInit(): void {
  }

  public update(menu: Menu): void {
    this.erroresValidacion = [];
    this.observ$ = this.adminSugerenciaService.update(menu).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.menu = json.data;

          // se está utilizando activeModal.close(true) en template
          // this.modalService.eventoCerrarModalScrollable.emit();
          swal.fire('menu actualizado', `${json.mensaje}, label: ${json.data.label}`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {
            this.showErrorService.httpErrorResponse(err, 'Error en actualización de menu', '', 'error');
          }
        }
      );
  }
  public create(menu: Menu): void {
    this.erroresValidacion = [];
    this.observ$ = this.adminSugerenciaService.create(menu).pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        json => {
          this.menu = json.data;
          // this.activeModal.close(true);
          // el cierre del modal se podría hacer con:

          // se está utilizando activeModal.close(true) desde el template
          // this.modalService.eventoCerrarModalScrollable.emit();

          // en lugar de activModal.close(true), se podría emitir evento
          // para cerrar modal con:
          // this.modalService.eventoCerrarModalScrollable.emit();
          // podriamos emitir este evento para cerrar modal con la
          // subscripcion que se hace con subscripcioneventoCerrarModalScrollable()
          // desde ClientesComponent

          swal.fire('creado tipo, no olvide asociar una foto', `${json.mensaje}, nombre: ${json.data.nombre}`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {
            this.showErrorService.httpErrorResponse(err, 'Error al crear menu', '', 'error');
          }
        }
      );
  }

  changedVisible(valor: any): void {

  }

  ngOnDestroy(): void{
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
