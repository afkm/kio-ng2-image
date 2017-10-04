import { ElementRef, OnInit, OnDestroy, AfterViewInit, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ContentDataComponent, ResizingService } from 'kio-ng2-component-routing';
import { LocaleService } from 'kio-ng2-i18n';
import { KioNg2ImageModuleConfig } from '../../config/interfaces';
export declare type ISize = {
    width: number;
    height: number;
};
export declare class ImageComponent extends ContentDataComponent implements AfterViewInit, OnInit, OnDestroy {
    protected moduleConfig: KioNg2ImageModuleConfig;
    protected localeService: LocaleService;
    protected resizingService: ResizingService;
    private resizeSubscription;
    loading: boolean;
    /** option to initially render downscaled images   */
    withPreview: boolean;
    imageScale: number;
    forceHighResolution: boolean;
    waitForViewport: boolean;
    load: EventEmitter<any>;
    stateChageTimeout: number;
    private _forceHighRes;
    private _initialized;
    getScale(): number;
    onLoadError(event: any): void;
    onImageLoadStart(event: any): void;
    onImageLoad(event: any): void;
    readonly sizeMultiplier: number;
    readonly fixedHeight: boolean;
    readonly fixedWidth: boolean;
    readonly cropStrategy: any;
    readonly fallbackFormat: any;
    readonly fitStrategy: any;
    readonly hasPlaceholder: boolean;
    isPreview: boolean;
    imageUrl: string;
    imageData: any;
    imgStyle: any;
    containerStyle: any;
    imageSizeChanges: EventEmitter<ISize>;
    containerSizeUpdates: EventEmitter<ISize>;
    protected _imageSize: any;
    imageSize: any;
    resizing: Observable<ISize>;
    sizeUpdates: Observable<{
        width: number;
        height: number;
    }>;
    paramUpdate: Observable<{
        w: number;
        h: number;
        dpr: number;
        fit: string;
        fm: string;
    } & {
        w: number;
        h: number;
    }>;
    imageURLUpdate: Observable<string>;
    updateSubscription: Subscription;
    imageContainer: ElementRef;
    needsReload(): boolean;
    refreshSize(): void;
    readonly imageOrientation: string;
    readonly allFixed: boolean;
    getRatio(): number;
    getContainerBounds(): any;
    getContainerSize(): {
        width: number;
        height: number;
    };
    protected resizeImage(): void;
    protected onResize(): void;
    protected onNodeUpdate(): void;
    protected onUpdate(): void;
    protected updateStyle(target: string, props: any): void;
    protected updateContainerStyle(props: any): void;
    /** hide until visible */
    touchedViewport: boolean;
    private scrollSubscription;
    private _initViewportLoading();
    private _unsubscribeScroll();
    getContentSize(): {
        width: number;
        height: number;
    };
    protected canLoadContentWithParams(contentParams: any): boolean;
    mapSizeToPreferredPreview(contentSize: {
        width: number;
        height: number;
    }): {
        width: number;
        height: number;
    };
    getContentParams(preferredSize?: ISize): {
        w: number;
        h: number;
        dpr: number;
        fit: string;
        fm: string;
    };
    resizeContainer(): void;
    buildContentURL(contentParams?: any): string;
    loadContent(): Observable<any>;
    loadNodeContent(): void;
    protected onMounted(): void;
    protected subscribeResizing(): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngAfterViewInit(): void;
    protected getDPR(): number;
}
