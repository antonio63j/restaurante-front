"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.AppComponent = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var common_1 = require("@angular/common");
var environment_1 = require("src/environments/environment");
var cookie_detalle_component_1 = require("./cookies/cookie-detalle/cookie-detalle.component");
var AppComponent = /** @class */ (function () {
    function AppComponent(empresaService, shareEmpresaService, carritoService, authService, showErrorService, conectorSocketService, ccService, translateService, platformId, titleService, metaTagService, router, modalConModeloService) {
        // window.dataLayer.push({'cookiesSet': true});
        // this.indicarUserConsent();
        this.empresaService = empresaService;
        this.shareEmpresaService = shareEmpresaService;
        this.carritoService = carritoService;
        this.authService = authService;
        this.showErrorService = showErrorService;
        this.conectorSocketService = conectorSocketService;
        this.ccService = ccService;
        this.translateService = translateService;
        this.platformId = platformId;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.router = router;
        this.modalConModeloService = modalConModeloService;
        this.observ$ = null;
        this.unsubscribe$ = new rxjs_1.Subject();
        console.log('arranque app.component, username: ---------------------------');
        console.log(this.authService.usuario.username);
        this.getEmpresa(1);
        this.conectorSocketService.connect();
        // No se utiliza, para este cometido se está utilizando GTM (Google Tag Manager)
        // --------------------------------------------------------
        // this.cookieParams = {
        //   googleAnalyticsDivName: 'divGoogleAnalytics',
        //   googleAnalyticsId: environment.googleAnalyticsId
        // };
        // const navEndEvents$ = this.router.events
        //   .pipe(
        //     filter(event => event instanceof NavigationEnd)
        //   );
        // navEndEvents$.subscribe((event: NavigationEnd) => {
        //   gtag('config', 'G-8SCFLYHJBQ', {
        //     page_path: event.urlAfterRedirects
        //   });
        // });
    }
    AppComponent.prototype.ngOnInit = function () {
        this.setTittleAndMetaTags();
        if (common_1.isPlatformBrowser(this.platformId)) {
            this.prepararCookieService();
        }
    };
    // no se están invocando, las libreias de tagmanager se incluyen en index.html
    // ----------------------------------------------
    // loadGoogleAnalytics(trackingID: string): void {
    //   const div = document.createElement('div');
    //   div.id = 'divGoogleAnalytics';
    //   const gaScript = document.createElement('script');
    //   gaScript.setAttribute('async', 'true');
    //   gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${trackingID}`);
    //   const gaScript2 = document.createElement('script');
    //   gaScript2.innerText = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag(\'config\', \'${trackingID}\');`;
    //   div.appendChild(gaScript);
    //   div.appendChild(gaScript2);
    //   const head = document.getElementsByTagName('head')[0];
    //   head.insertBefore(div, head.firstChild);
    //   // document.getElementsByTagName('head')[0].appendChild(div);
    // }
    // // no se está invocando, se incluye en index.html
    //   removeGoogleAnalytics(divId: string): void {
    //     document.getElementById(divId).remove();
    //   }
    // ----------------------------------------------
    AppComponent.prototype.setTittleAndMetaTags = function () {
        this.titleService.setTitle("Restaurante");
        this.metaTagService.addTags([
            { name: 'keywords', content: 'menu, carta, pedido, online, domicilio, recoger, cocina, restaurante, calidad, precio, cerca' },
            { name: 'robots', content: 'index, follow' },
            { name: 'author', content: 'Restaurante' },
        ]);
    };
    AppComponent.prototype.prepararCookieService = function () {
        // Support for translated cookies messages
        var _this = this;
        // this.translateService.addLangs(['en', 'es']);
        // this.translateService.setDefaultLang('en');
        // const browserLang = this.translateService.getBrowserLang();
        // this.translateService.use(browserLang.match(/en|es/) ? browserLang : 'en');
        this.translateService
            .get(['cookie.header', 'cookie.message', 'cookie.dismiss', 'cookie.allow', 'cookie.deny', 'cookie.link', 'cookie.policy'])
            .subscribe(function (data) {
            _this.ccService.getConfig().content = _this.ccService.getConfig().content || {};
            // Override default messages with the translated ones
            _this.ccService.getConfig().content.header = data['cookie.header'];
            _this.ccService.getConfig().content.message = data['cookie.message'];
            _this.ccService.getConfig().content.dismiss = data['cookie.dismiss'];
            _this.ccService.getConfig().content.allow = data['cookie.allow'];
            _this.ccService.getConfig().content.deny = data['cookie.deny'];
            _this.ccService.getConfig().content.link = data['cookie.link'];
            _this.ccService.getConfig().content.policy = data['cookie.policy'];
            _this.ccService.destroy(); // remove previous cookie bar (with default messages)
            _this.ccService.init(_this.ccService.getConfig()); // update config with translated messages
            if (!_this.ccService.hasConsented()) {
                _this.deleteCookies();
            }
        });
        // subscribe to cookieconsent observables to react to main events
        this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(function () {
            // you can use this.ccService.getConfig() to do stuff...
            // console.log('popupOpenSubscription');
            // console.log(this.ccService.getConfig());
        });
        this.popupCloseSubscription = this.ccService.popupClose$.subscribe(function () {
            // you can use this.ccService.getConfig() to do stuff...
            // console.log('popupCloseSubscription');
        });
        this.initializeSubscription = this.ccService.initialize$.subscribe(function (event) {
            // you can use this.ccService.getConfig() to do stuff...
            // console.log('initializeSubscription');
        });
        this.statusChangeSubscription = this.ccService.statusChange$.subscribe(function (event) {
            if (event.status === 'deny') {
                // this.cookiesDetalle(this.cookieParams);
                console.log('hasConsented:');
                console.log(_this.ccService.hasConsented());
                if (common_1.isPlatformBrowser(_this.platformId)) {
                    window.dataLayer.push({ event: 'cookieNoOK' });
                    _this.deleteCookies();
                }
                // this.ccService.close(false);
            }
            else {
                if (event.status === 'allow') {
                    // window['dataLayer'].push({cookiesSet: true});
                    if (common_1.isPlatformBrowser(_this.platformId)) {
                        window.dataLayer.push({ event: 'cookieOK' });
                    }
                }
            }
        });
        this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(function () {
            // you can use this.ccService.getConfig() to do stuff...
            // console.log('revokeChoiceSubscription');
        });
        this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(function (event) {
            // you can use this.ccService.getConfig() to do stuff...
            // console.log('noCookieLawSubscription');
        });
    };
    AppComponent.prototype.deleteCookies = function () {
        document.cookie = "_ga=; Path=/; Domain=" + environment_1.environment.domain + "; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "_ga_" + environment_1.environment.googleAnalyticsId + "=; Path=/; Domain=" + environment_1.environment.domain + "; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    };
    // de momento no se está invocando
    AppComponent.prototype.cookiesDetalle = function (cookieParams) {
        this.modalConModeloService.openModalScrollable(cookie_detalle_component_1.CookieDetalleComponent, { size: 'lg', backdrop: 'static', scrollable: true, centered: true, keyboard: false }, cookieParams, 'cookiParams', 'Los campos con * son obligatorios', 'Datos del sugerencia').pipe(operators_1.take(1) // take() manages unsubscription for us
        ).subscribe(function (result) {
            console.log({ confirmedResult: result });
            // this.sugerenciaService.getSugerencias(this.filtroSugerencia).subscribe(respon => {
            //     this.sugerencias = respon.content as Sugerencia[];
            //     this.paginador = respon;
            //         });
        });
    };
    AppComponent.prototype.getEmpresa = function (id) {
        var _this = this;
        this.observ$ = this.empresaService.get(id).pipe(operators_1.takeUntil(this.unsubscribe$))
            .subscribe(function (json) {
            _this.empresa = json;
            if (common_1.isPlatformBrowser(_this.platformId)) {
                document.title = _this.empresa.nombre;
            }
            // this.carritoService.cargaCarrito();
            _this.shareEmpresaService.updateEmpresaMsg(_this.empresa);
            console.log('enviado cambio datos empresa');
        }, function (err) { return _this.showErrorService.httpErrorResponse(err, 'Carga datos de empresa', '', 'error'); });
    };
    AppComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy (), realizando unsubscribes');
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        if (this.observ$ != null && !this.observ$.closed) {
            console.log('haciendo : this.observ$.unsubscribe()');
            this.observ$.unsubscribe();
        }
        else {
            console.log('No necesario hacer: this.observ$.unsubscribe()');
        }
        // unsubscribe to cookieconsent observables to prevent memory leaks
        if (common_1.isPlatformBrowser(this.platformId)) {
            this.popupOpenSubscription.unsubscribe();
            this.popupCloseSubscription.unsubscribe();
            this.initializeSubscription.unsubscribe();
            this.statusChangeSubscription.unsubscribe();
            this.revokeChoiceSubscription.unsubscribe();
            this.noCookieLawSubscription.unsubscribe();
        }
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.scss']
        }),
        __param(8, core_1.Inject(core_1.PLATFORM_ID))
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
