import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';




import { HttpParams } from '@angular/common/http';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../usuarios/auth.service';
import { CarritoService } from 'src/app/pages-store/carrito/carrito.service';

interface SubMenu {
    routLink: string;
    key: string;
    class: string;
    keyView: string;
  }

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})


export class SidebarComponent implements OnInit {
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    private observ$: Subscription = null;
    private unsubscribe$ = new Subject();

    public hiddenProductosEnCarrito = false;
    public numArticulosCarrito = 0;
    public subscripcionNumArticulosEnCarrito: Subscription;


    @Output() collapsedEvent = new EventEmitter<boolean>();

  constructor(
    private translate: TranslateService,
    public router: Router,
    public authService: AuthService,
    public carritoService: CarritoService

  ) {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });
  }

    ngOnInit(): void {
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        this.subscripcionNumArticulosEnCarrito = this.carritoService.getNumArticulosCarritoMsg()
        .subscribe(num => {
            console.log('recibido cambios datos carrito, numArticulos= ' + num);
            this.numArticulosCarrito = num;
        });
    }

    eventCalled(): void {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any): void {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    // toggleCollapsed() {
    //     this.collapsed = !this.collapsed;
    //     console.log(`se emite evento collapsedEvent a ${this.collapsed}`);
    //     this.collapsedEvent.emit(this.collapsed);
    // }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar(): void {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr(): void {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    changeLang(language: string): void {
        this.translate.use(language);
    }

    onLoggedout(): void {
        // localStorage.removeItem('isLoggedin');
        this.authService.logout();
        this.router.navigate(['\dashboard']);
    }
    onSelectAll(items: any): void {
    }
  }
