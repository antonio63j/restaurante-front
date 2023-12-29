import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarritoComponent } from './carrito/carrito.component';
import { TramitarCarritoComponent } from './carrito/tramitar-carrito/tramitar-carrito.component';
import { CartaComponent } from './carta/carta.component';
import { MenuComponent } from './menu/menu.component';


const routes: Routes = [

  {
    path: 'carta', component: CartaComponent,
  }
  ,
  {
    path: 'menu', component: MenuComponent,
  },
  {
    path: 'carrito', component: CarritoComponent,
    // children: [

    //   { path: 'tramitar/:idCarrito', component: TramitarCarritoComponent},
    // ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesStoreRoutingModule { }
