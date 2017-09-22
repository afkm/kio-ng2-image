var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//import '../../../../debug'
import { isDevMode, Input, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { KioContentState } from 'kio-ng2-data';
import { RoutableComponent, ContentDataComponent, ResizingService } from 'kio-ng2-component-routing';
import { LocaleService } from 'kio-ng2-i18n';
import * as urlUtils from 'url';
var DEBOUNCE_RESIZE = 500;
var SIZE_BOUNCE = 350;
var KIO_IMG_URL = 'https://kioget.37x.io/img';
var roundSize = function (size) {
    var width = size.width, height = size.height;
    return {
        width: Math.round(width),
        height: Math.round(height)
    };
};
var applyScale = function (scale) { return function (size) {
    if (size.width < (10 / scale) || size.height < (10 / scale))
        return size;
    return {
        width: size.width * scale,
        height: size.height * scale
    };
}; };
var ImageComponent = /** @class */ (function (_super) {
    __extends(ImageComponent, _super);
    function ImageComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.localeService = _this.injector.get(LocaleService);
        _this.resizingService = _this.injector.get(ResizingService);
        /** option to initially render downscaled images   */
        _this.withPreview = false;
        _this.imageScale = 0.2;
        _this.load = new EventEmitter();
        _this.stateChageTimeout = 5000;
        _this._initialized = new EventEmitter();
        _this.isPreview = _this.withPreview;
        _this.imgStyle = {};
        _this.containerStyle = {};
        _this.imageSizeChanges = new EventEmitter();
        _this.containerSizeUpdates = new EventEmitter();
        _this._imageSize = {};
        _this.resizing = _this.resizingService.resize;
        _this.sizeUpdates = _this.imageSizeChanges
            .skipUntil(_this._initialized)
            .map(applyScale(_this.getScale()))
            .map(roundSize)
            .distinctUntilChanged(function (left, right) { return (left.width === right.width) && (left.height === right.height); });
        _this.paramUpdate = _this.sizeUpdates
            .map(function (size) { return _this.mapSizeToPreferredPreview(size); })
            .map(roundSize)
            .map(function (size) {
            return _this.getContentParams(size);
        })
            .filter(function (contentParams) { return _this.canLoadContentWithParams(contentParams); });
        _this.imageURLUpdate = _this.paramUpdate.map(function (params) { return _this.buildContentURL(params); });
        _this.updateSubscription = _this.imageURLUpdate
            .subscribe(function (imageURL) {
            _this.imageUrl = imageURL;
        }, function (error) { return console.error(error); }, function () { return console.log(_this.node.cuid + " - update subscription completed"); });
        return _this;
    }
    Object.defineProperty(ImageComponent.prototype, "forceHighResolution", {
        get: function () {
            return this._forceHighRes === true;
        },
        set: function (highRes) {
            this._forceHighRes = highRes === true;
        },
        enumerable: true,
        configurable: true
    });
    ImageComponent.prototype.getScale = function () {
        return this.isPreview ? this.imageScale : 1;
    };
    ImageComponent.prototype.onLoadError = function () {
        var _this = this;
        this.data = null;
        setTimeout(function () { return _this.loadNodeContent(); }, 1000);
    };
    ImageComponent.prototype.onImageLoadStart = function (event) {
        this.updateContentState(KioContentState.loading);
    };
    ImageComponent.prototype.onImageLoad = function (event) {
        this.updateContentState(KioContentState.loaded);
        this.load.emit();
        if (this.isPreview) {
            this.isPreview = false;
            this.imageScale = 1;
            this.refreshSize();
        }
        //console.log('image loaded', event)
    };
    Object.defineProperty(ImageComponent.prototype, "fixedHeight", {
        get: function () {
            return this.viewParams.fixedHeight === true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "fixedWidth", {
        get: function () {
            return this.viewParams.fixedWidth === true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "cropStrategy", {
        get: function () {
            return this.viewParams.cropStrategy || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "fallbackFormat", {
        get: function () {
            return this.viewParams.fallbackFormat || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "fitStrategy", {
        get: function () {
            return this.viewParams.fitStrategy || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "hasPlaceholder", {
        get: function () {
            return !!this.data && this.isPreview && this.contentState < 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "imageSize", {
        set: function (size) {
            size = roundSize(size);
            this.imageSizeChanges.emit(size);
        },
        enumerable: true,
        configurable: true
    });
    ImageComponent.prototype.needsReload = function () {
        if (this.contentState !== KioContentState.loading && this.fixedHeight && !this.data) {
            var _a = this.getContainerBounds(), width = _a.width, height = _a.height;
            return width >= 10 && height >= 10;
        }
    };
    ImageComponent.prototype.refreshSize = function () {
        this.resizeContainer();
        this.resizeImage();
    };
    Object.defineProperty(ImageComponent.prototype, "imageOrientation", {
        get: function () {
            if (this.node) {
                return this.getRatio() < 1 ? 'portrait' : 'landscape';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageComponent.prototype, "allFixed", {
        get: function () {
            return this.fixedHeight && this.fixedWidth;
        },
        enumerable: true,
        configurable: true
    });
    ImageComponent.prototype.getRatio = function () {
        if (this.node && this.node.headers) {
            return this.node.headers.ratio || 1;
        }
        return 1;
    };
    ImageComponent.prototype.getContainerBounds = function () {
        return this.imageContainer.nativeElement.getBoundingClientRect();
    };
    ImageComponent.prototype.getContainerSize = function () {
        return roundSize(this.getContainerBounds());
    };
    ImageComponent.prototype.resizeImage = function () {
        var contentSize = this.getContentSize();
        this.imageSize = contentSize;
    };
    ImageComponent.prototype.onResize = function () {
        this.refreshSize();
    };
    ImageComponent.prototype.onNodeUpdate = function () {
        if (this.node && this.node.headers.color) {
            this.updateContainerStyle({ 'background-color': this.node.headers.color });
            this._initialized.emit(true);
        }
        if (this.node && this.node.modifiers.indexOf('force-highres') > -1) {
            this.forceHighResolution = true;
        }
        _super.prototype.onNodeUpdate.call(this);
    };
    ImageComponent.prototype.onUpdate = function () {
        //super.onUpdate()
        this.imageData = this.data;
        this.imageUrl = this.data ? this.data.url : undefined;
        this.refreshSize();
        if (this.isPreview) {
            this.isPreview = false;
            //this.loadNodeContent()
        }
    };
    ImageComponent.prototype.updateStyle = function (target, props) {
        var targetProp = this[target + 'Style'];
        this[target + 'Style'] = Object.assign({}, targetProp, props);
    };
    ImageComponent.prototype.updateContainerStyle = function (props) {
        var _this = this;
        this.updateStyle('container', props);
        process.nextTick(function () {
            _this.containerSizeUpdates.emit(_this.getContainerSize());
        });
    };
    ImageComponent.prototype.getContentSize = function () {
        var containerSize = this.getContainerSize();
        var ratio = this.getRatio();
        var contentSize = {};
        // console.log('fixedHeight is ', this.fixedHeight)
        if (this.allFixed) {
            contentSize.width = containerSize.width;
            contentSize.height = containerSize.height || (containerSize.width / ratio);
        }
        else if (this.fixedHeight) {
            contentSize.width = containerSize.height * ratio;
            contentSize.height = containerSize.height;
        }
        else {
            contentSize.width = containerSize.width;
            contentSize.height = containerSize.width / ratio;
        }
        return roundSize(contentSize);
    };
    ImageComponent.prototype.canLoadContentWithParams = function (contentParams) {
        var errors = [];
        if (contentParams.w < 10)
            errors.push("Content parameter property w must be >= 10, but it is " + contentParams.w);
        if (contentParams.h < 10)
            errors.push("Content parameter property h must be >= 10, but it is " + contentParams.h);
        if (errors.length > 0 && isDevMode()) {
            console.error.apply(console, ['invalid content params for image %s: ', this.node.cuid].concat(errors));
        }
        return errors.length === 0;
    };
    ImageComponent.prototype.mapSizeToPreferredPreview = function (contentSize) {
        if (this.imageOrientation === 'portrait' && contentSize.width > SIZE_BOUNCE) {
            var previewWidth = contentSize.width - (contentSize.width % SIZE_BOUNCE);
            var m = previewWidth / contentSize.width;
            return {
                width: previewWidth,
                height: Math.floor(contentSize.height * m)
            };
        }
        else if (this.imageOrientation !== 'portrait' && contentSize.height > SIZE_BOUNCE) {
            var previewHeight = contentSize.height - (contentSize.height % SIZE_BOUNCE);
            var m = previewHeight / contentSize.height;
            return {
                width: Math.floor(contentSize.width * m),
                height: previewHeight
            };
        }
        return contentSize;
    };
    ImageComponent.prototype.getContentParams = function (preferredSize) {
        var params = {
            w: preferredSize.width,
            h: preferredSize.height,
            dpr: this._forceHighRes ? window.devicePixelRatio : 1,
            fit: this.allFixed ? 'crop' : 'clip',
            fm: 'jpg' // default fallback format
        };
        if (this.cropStrategy && typeof this.cropStrategy === 'string') {
            params['crop'] = this.cropStrategy;
        }
        if (this.fallbackFormat && typeof this.fallbackFormat === 'string') {
            params['fm'] = this.fallbackFormat;
        }
        if (this.fitStrategy && typeof this.fitStrategy === 'string') {
            params['fit'] = this.fitStrategy;
        }
        return params;
    };
    ImageComponent.prototype.resizeContainer = function () {
        if (this.allFixed) {
            // console.log('its all fixed', this.getContainerBounds().height)
            // nothing, we assume image-container has dimensions from parent component
        }
        else if (this.fixedHeight) {
            // height was set by parent component, we need to calculate the width
            this.updateContainerStyle({
                height: 'auto',
                width: (this.getContainerSize().height * this.getRatio()) + 'px'
            });
        }
        else {
            // width was set by parent component, we need to calculate the height
            this.updateContainerStyle({
                width: 'auto',
                height: (this.getContainerSize().width / this.getRatio()) + 'px'
            });
        }
    };
    ImageComponent.prototype.buildContentURL = function (contentParams) {
        if (contentParams === void 0) { contentParams = {}; }
        var imageUrl = urlUtils.parse(KIO_IMG_URL + "/" + this.node.cuid + "/" + this.localeService.currentLocale);
        imageUrl.query = contentParams;
        return urlUtils.format(imageUrl);
    };
    ImageComponent.prototype.loadContent = function () {
        var self = this;
        var t0 = Date.now();
        return Observable.throw("ImageComponent::loadContent() is deprecated");
    };
    ImageComponent.prototype.loadNodeContent = function () {
        if (this.imageContainer) {
            this.refreshSize();
        }
    };
    ImageComponent.prototype.onMounted = function () {
        if (!this.data && this.node) {
            this.loadNodeContent();
        }
    };
    ImageComponent.prototype.subscribeResizing = function () {
        var _this = this;
        this.resizeSubscription = this.resizing.subscribe(function (e) {
            _this.onResize();
        });
    };
    ImageComponent.prototype.ngOnInit = function () {
        this._initialized.emit(true);
        _super.prototype.ngOnInit.call(this);
    };
    ImageComponent.prototype.ngOnDestroy = function () {
        this.updateSubscription.unsubscribe();
        _super.prototype.ngOnDestroy.call(this);
    };
    ImageComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        //console.log('ngAfterInit with viewParams', this.viewParams, '\n', this)
        this.subscribeResizing();
        _super.prototype.ngAfterViewInit.call(this);
        if (this.imageContainer) {
            process.nextTick(function () {
                // some bug in angular makes this necessary
                _this.onMounted();
            });
        }
    };
    ImageComponent.propDecorators = {
        'withPreview': [{ type: Input },],
        'imageScale': [{ type: Input, args: ['initialScale',] },],
        'forceHighResolution': [{ type: Input, args: ['forceHighResolution',] },],
        'load': [{ type: Output },],
        'imageContainer': [{ type: ViewChild, args: ['imageContainer',] },],
    };
    ImageComponent = __decorate([
        RoutableComponent({
            moduleId: module.id,
            selector: 'publication-image',
            templateUrl: './image.component.html',
            styleUrls: ['./image.component.scss'],
            encapsulation: ViewEncapsulation.None,
            queryable: {
                type: 'src',
                modifiers: ['image']
            }
        })
    ], ImageComponent);
    return ImageComponent;
}(ContentDataComponent));
export { ImageComponent };
//# sourceMappingURL=image.component.js.map