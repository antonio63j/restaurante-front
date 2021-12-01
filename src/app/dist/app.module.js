"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = exports.MY_FORMATS = void 0;
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var app_component_1 = require("./app.component");
var app_routing_module_1 = require("./app-routing.module");
var core_2 = require("@ngx-translate/core");
var language_translation_module_1 = require("./shared/modules/language-translation/language-translation.module");
var http_1 = require("@angular/common/http");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var animations_1 = require("@angular/platform-browser/animations");
var modal_service_1 = require("./shared/services/modal.service");
var modal_con_modelo_service_1 = require("./shared/services/modal-con-modelo.service");
var auth_service_1 = require("./usuarios/auth.service");
var core_3 = require("@angular/material/core");
var token_interceptor_1 = require("./usuarios/interceptors/token.interceptor");
var auth_interceptor_1 = require("./usuarios/interceptors/auth.interceptor");
var logging_interceptor_1 = require("./usuarios/interceptors/logging.interceptor");
var select_1 = require("@angular/material/select");
var recortar_pipe_1 = require("./shared/pipes/recortar.pipe");
var common_1 = require("@angular/common");
var ngx_cookieconsent_1 = require("ngx-cookieconsent");
var environment_1 = require("src/environments/environment");
exports.MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY'
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MM YYYY',
        dateA11yLabel: 'DD/MM/YYYY',
        monthYearA11yLabel: 'MM YYYY'
    }
};
var cookieConfig = {
    cookie: {
        domain: environment_1.env.app + environment_1.environment.domain // it is recommended to set your domain, for cookies to work properly
    },
    palette: {
        popup: {
            background: '#D67124'
        },
        button: {
            background: '#D67124'
        }
    },
    theme: 'classic',
    position: 'bottom-right',
    type: 'opt-out',
    layout: 'basic',
    layouts: {
        'my-custom-layout': '{{messagelink}}{{compliance}}'
    },
    elements: {
        messagelink: "\n    <span id=\"cookieconsent:desc\" class=\"cc-message\">{{message}}\n      <a aria-label=\"learn more about cookies\" tabindex=\"0\" class=\"cc-link\" href=\"{{cookiePolicyHref}}\" target=\"_blank\">{{cookiePolicyLink}}</a>, \n      <a aria-label=\"learn more about our privacy policy\" tabindex=\"1\" class=\"cc-link\" href=\"{{privacyPolicyHref}}\" target=\"_blank\">{{privacyPolicyLink}}</a> y \n      <a aria-label=\"learn more about our terms of service\" tabindex=\"2\" class=\"cc-link\" href=\"{{tosHref}}\" target=\"_blank\">{{tosLink}}</a>\n    </span>\n    "
    },
    content: {
        message: 'By using our site, you acknowledge that you have read and understand our ',
        cookiePolicyLink: 'Política de cookies',
        cookiePolicyHref: environment_1.environment.urlEndPoint + '/api/politica-cookies',
        privacyPolicyLink: 'Política de privacidad',
        privacyPolicyHref: environment_1.environment.urlEndPoint + '/api/politica-cookies',
        tosLink: 'Términos del servicio',
        tosHref: environment_1.environment.urlEndPoint + '/api/politica-cookies'
    }
};
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_component_1.AppComponent,
                recortar_pipe_1.RecortarPipe,
            ],
            imports: [
                platform_browser_1.BrowserModule.withServerTransition({ appId: 'serverApp' }),
                app_routing_module_1.AppRoutingModule,
                core_2.TranslateModule,
                language_translation_module_1.LanguageTranslationModule,
                http_1.HttpClientModule,
                animations_1.BrowserAnimationsModule,
                ng_bootstrap_1.NgbModule,
                select_1.MatSelectModule,
                core_3.MatNativeDateModule,
                ngx_cookieconsent_1.NgcCookieConsentModule.forRoot(cookieConfig)
            ],
            exports: [],
            providers: [
                modal_service_1.ModalService,
                modal_con_modelo_service_1.ModalConModeloService,
                auth_service_1.AuthService,
                common_1.DatePipe,
                // {provide: DEFAULT_CURRENCY_CODE, useValue: 'es'},
                { provide: core_1.LOCALE_ID, useValue: 'es' },
                { provide: core_3.MAT_DATE_LOCALE, useValue: 'es' },
                { provide: core_3.MAT_DATE_FORMATS, useValue: exports.MY_FORMATS },
                { provide: http_1.HTTP_INTERCEPTORS, useClass: token_interceptor_1.TokenInterceptor, multi: true },
                { provide: http_1.HTTP_INTERCEPTORS, useClass: auth_interceptor_1.AuthInterceptor, multi: true },
                { provide: http_1.HTTP_INTERCEPTORS, useClass: logging_interceptor_1.LoggingInterceptor, multi: true },
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
