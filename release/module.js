import { NgModule } from '@angular/core';
import { KioNg2ComponentRoutingModule } from 'kio-ng2-component-routing';
import { KioCtnModule } from 'kio-ng2-ctn';
import { ImageComponent } from './components/image/image.component';
import { KioNg2i18nModule } from 'kio-ng2-i18n';
import { KioNg2ScrollingModule } from 'kio-ng2-scrolling';
import { InlineSVGModule, InlineSVGDirective } from 'ng-inline-svg';
import { IMAGE_MODULE_CONFIG } from './config/IMAGE_MODULE_CONFIG.token';
export { IMAGE_MODULE_CONFIG } from './config/IMAGE_MODULE_CONFIG.token';
var KioNg2ImageModule = (function () {
    function KioNg2ImageModule() {
    }
    KioNg2ImageModule.forRoot = function (config) {
        return {
            ngModule: KioNg2ImageModule,
            providers: [
                {
                    provide: IMAGE_MODULE_CONFIG,
                    useValue: {
                        waitForViewport: 'waitForViewport' in config ? config.waitForViewport : true,
                        viewportMargin: 'viewportMargin' in config ? config.viewportMargin : 1.2
                    }
                }
            ]
        };
    };
    return KioNg2ImageModule;
}());
export { KioNg2ImageModule };
KioNg2ImageModule.decorators = [
    { type: NgModule, args: [{
                imports: [KioNg2ComponentRoutingModule, KioNg2ScrollingModule, KioCtnModule, KioNg2i18nModule, InlineSVGModule],
                declarations: [ImageComponent],
                providers: [
                    {
                        provide: IMAGE_MODULE_CONFIG,
                        useValue: {
                            waitForViewport: true,
                            viewportMargin: 1.2
                        }
                    },
                    InlineSVGDirective
                ],
                entryComponents: [ImageComponent],
                exports: [KioNg2ComponentRoutingModule, KioNg2ScrollingModule, ImageComponent, KioCtnModule, KioNg2i18nModule]
            },] },
];
/** @nocollapse */
KioNg2ImageModule.ctorParameters = function () { return []; };
