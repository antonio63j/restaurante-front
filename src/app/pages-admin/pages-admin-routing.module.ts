import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminIndexComponent } from './admin-index/admin-index.component';
import { AdminMenuSugerenciaComponent } from './admin-menu-sugerencia/admin-menu-sugerencia.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminPedidoFormComponent } from './admin-pedido/admin-pedido-form/admin-pedido-form.component';
import { AdminPedidoComponent } from './admin-pedido/admin-pedido.component';
import { AdminSlidersComponent } from './admin-sliders/admin-sliders.component';
import { AdminSugerenciaComponent } from './admin-sugerencia/admin-sugerencia.component';
import { AdminTipoplatoComponent } from './admin-tipoplato/admin-tipoplato.component';
import { EmpresaComponent } from './empresa/empresa.component';

const routes: Routes = [
  {
    path: '', component: AdminIndexComponent,
  }
  ,
  {
    path: 'empresa', component: EmpresaComponent,
  }
  ,
  {
    path: 'admhome', component: AdminHomeComponent,
  }
  ,
  {
    path: 'admslider', component: AdminSlidersComponent,
  },
  {
    path: 'admtipoplato', component: AdminTipoplatoComponent,
  },
  {
    path: 'admsugerencia', component: AdminSugerenciaComponent,
  },

  {
    path: 'admmenu', component: AdminMenuComponent,
  },

  {
    path: 'admmenusugerencia/:id', component: AdminMenuSugerenciaComponent,
  },

  {
    path: 'admpedido', component: AdminPedidoComponent,
  },

  {
    path: 'admpedidoform/:pedidoId', component: AdminPedidoFormComponent,
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesAdminRoutingModule { }
