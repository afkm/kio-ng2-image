import { NgModule } from '@angular/core';
import { KioNg2ComponentRoutingModule } from 'kio-ng2-component-routing';
import { KioCtnModule } from 'kio-ng2-ctn';
import { ImageComponent } from './components/image/image.component';
var KioNg2ImageModule = /** @class */ (function () {
    function KioNg2ImageModule() {
    }
    KioNg2ImageModule.decorators = [
        { type: NgModule, args: [{
                    imports: [KioNg2ComponentRoutingModule, KioCtnModule],
                    declarations: [ImageComponent],
                    entryComponents: [ImageComponent],
                    exports: [KioNg2ComponentRoutingModule, ImageComponent, KioCtnModule]
                },] },
    ];
    /** @nocollapse */
    KioNg2ImageModule.ctorParameters = function () { return []; };
    return KioNg2ImageModule;
}());
export { KioNg2ImageModule };
//# sourceMappingURL=module.js.map