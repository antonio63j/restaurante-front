import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Slider } from '../shared/modelos/slider';
import { AdminSliderService } from '../pages-admin/admin-sliders/admin-slider.service';
import { routerTransition } from '../router.animations';
import swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ShareEmpresaService } from '../shared/services/share-empresa.service';
import { Empresa } from '../shared/modelos/empresa';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit, OnDestroy {
    // public alerts: Array<any> = [];
    // public sliders: Array<any> = [];
    // public utilidades: Array<any> = [];

    public sliders: Slider [];

    private unsubscribe$ = new Subject();
    public host: string = environment.urlEndPoint;
    public loading: boolean;
    public subscription: Subscription;
    public empresa: Empresa = new Empresa();

    constructor(
      private sliderService: AdminSliderService,
      public shareEmpresaService: ShareEmpresaService

      ) {
    }

    ngOnInit(): void {
      this.loading = true;
      this.subscription = this.shareEmpresaService.getEmpresaMsg().pipe(
        takeUntil(this.unsubscribe$))
      .subscribe(msg => {
          console.log('recibido cambio datos empresa');
          this.empresa = msg;
        });
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy (), realizando unsubscribes');
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
