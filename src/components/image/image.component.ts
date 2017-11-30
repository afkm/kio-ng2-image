//import '../../../../debug'
import { isDevMode, Component, Input, ViewChild, ElementRef, Inject, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges, SimpleChange, ViewEncapsulation, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription, AsyncSubject, Observer, Scheduler } from 'rxjs'
import { KioContent, KioSrcData, KioContentState } from 'kio-ng2-data'
import { RoutableComponent, ContentDataComponent, ContentLoaderDirective, ResizingService } from 'kio-ng2-component-routing'
import { LocaleService } from 'kio-ng2-i18n'
import { BackendService, DataDirective } from 'kio-ng2-ctn'
import * as urlUtils from 'url'

import { MarginPosition } from 'kio-ng2-scrolling'

import { IMAGE_MODULE_CONFIG } from '../../config/IMAGE_MODULE_CONFIG.token'
import { KioNg2ImageModuleConfig } from '../../config/interfaces'

const DEBOUNCE_RESIZE = 500
const SIZE_BOUNCE = 350
const KIO_IMG_URL = 'https://kioget.37x.io/img'

const LOW_RES_MAX_DPR = 1.5


export type ISize = {
  width: number
  height: number
}

const roundSize = ( size:any ) => {
  const { width, height } = size
  return {
    width: Math.round(width) ,
    height: Math.round(height)
  }
}

const applyScale = ( scale:number ) => ( size:ISize ) => {
  if ( size.width < (10/scale) || size.height < (10/scale) )
  return size
  return {
    width: size.width * scale,
    height: size.height * scale
  }
}

@RoutableComponent({
  selector: 'publication-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  encapsulation: ViewEncapsulation.None,
  queryable: {
    type: 'src' ,
    modifiers: ['image']
  }
})
export class ImageComponent extends ContentDataComponent implements AfterViewInit, OnInit, OnDestroy {

  protected moduleConfig:KioNg2ImageModuleConfig=this.injector.get(IMAGE_MODULE_CONFIG)
  protected localeService:LocaleService=this.injector.get(LocaleService)
  protected resizingService:ResizingService=this.injector.get(ResizingService)
  private resizeSubscription:Subscription

  
  loading:boolean = true

  /** option to initially render downscaled images   */
  @Input() withPreview:boolean
  @Input('initialScale') imageScale:number=0.2
  @Input('forceHighResolution') set forceHighResolution(highRes:boolean) {
    this._forceHighRes = highRes === true
  }

  public isLoading:boolean=true

  get forceHighResolution ():boolean {
    return this._forceHighRes === true
  }

  @Input() waitForViewport:boolean=true
  @Output() load:EventEmitter<any>=new EventEmitter<any>()

  stateChageTimeout:number=5000

  private _forceHighRes:boolean
  private _initialized:EventEmitter<boolean>=new EventEmitter()

  getScale():number {
    return this.isPreview ? this.imageScale : 1
  }

  onLoadError ( event:any ):void {
    //console.log('image load error', event)
    this.isLoading = false
    this.data = null
    setTimeout(()=>this.loadNodeContent(),1000)
  }

  onImageLoadStart(event:any):void{
    this.isLoading = true
    this.updateContentState ( KioContentState.loading )
  }

  onImageLoad(event:any):void{
    this.isLoading = false
    this.updateContentState ( KioContentState.loaded )
    this.load.emit()
    
    if ( this.withPreview !== false ) {
      if ( this.imageScale < 1 ) {
        this.imageScale = 1 
        this.refreshSize()
      }
      else {
        this.isPreview = false
      }
    }

    this.loading = false
    //console.log('image loaded', event)
  }

  get sizeMultiplier():number {
    return this.viewParams.multiplier || 1
  }

  get fixedHeight():boolean {
    return this.viewParams.fixedHeight === true
  }

  get fixedWidth():boolean {
    return this.viewParams.fixedWidth === true
  }

  get cropStrategy():any {
    return this.viewParams.cropStrategy || false
  }

  get fallbackFormat():any {
    return this.viewParams.fallbackFormat || false
  }

  get fitStrategy():any {
    return this.viewParams.fitStrategy || false
  }

  get hasPlaceholder():boolean {
    return !!this.data && this.isPreview && this.contentState < 2
  }


  isPreview:boolean

  imageUrl:string

  imageData:any;
  imgStyle:any={}
  containerStyle:any={}

  imageSizeChanges:EventEmitter<ISize>=new EventEmitter()
  containerSizeUpdates:EventEmitter<ISize>=new EventEmitter()


  protected _imageSize:any={};

  set imageSize ( size:any ) {
    size = roundSize ( size )
    //console.log('set size to ', size )
    if ( !this.imageContainer.nativeElement.isConnected ) {
      if ( isDevMode() && this.moduleConfig.debugging === true ) {
        console.warn(`Tried to resize image ${this.node.cuid} while element is not connected.`)
      }
    } else {
      this.imageSizeChanges.emit(size)
    }
  }


  resizing:Observable<ISize>=this.resizingService.resize

  sizeUpdates=this.imageSizeChanges
  .skipUntil ( this._initialized )
  .map ( size => {
    return applyScale(this.getScale())(size)
  } )
  .map ( roundSize )
  .filter ( size => size.width > 0 && size.height > 0 )
  .distinctUntilChanged(
    (left,right) => {
      return left.width > 0 && left.height > 0 && ( left.width === right.width ) && ( left.height === right.height )
    }
  )

  paramUpdate=this.sizeUpdates
  .map ( size => this.mapSizeToPreferredPreview(size) )
  .map ( roundSize )
  .map ( size => {
    return this.getContentParams(size)
  } )
  .filter ( contentParams => this.canLoadContentWithParams(contentParams) )
  .map ( contentParams => {
    // console.log('%s::ImageComponent::containerBounds', this.node.cuid, this.getContainerBounds() )
    // console.log('%s::ImageComponent::contentParams', this.node.cuid, contentParams)
    // console.log('%s::ImageComponent::sizeMultiplier', this.node.cuid, this.sizeMultiplier)
    return Object.assign({},contentParams,{
      w: contentParams.w * this.sizeMultiplier,
      h: contentParams.h * this.sizeMultiplier
    })
  } )

  imageURLUpdate=this.paramUpdate.map ( params => this.buildContentURL(params) )


  updateSubscription=this.imageURLUpdate
  .subscribe ( imageURL => {
    if ( this.isPreview ) {
      this.imageContainer.nativeElement.classList.add('preview')
    } else {
      this.imageContainer.nativeElement.classList.remove('preview')
    }
    this.imageUrl = imageURL
  },
  error => console.error(error),
  () => console.log(`${this.node.cuid} - update subscription completed`) )

  @ViewChild('imageContainer') imageContainer:ElementRef


  needsReload () {
    if ( this.contentState !== KioContentState.loading && this.fixedHeight && !this.data )
    {
      const { width , height } = this.getContainerBounds()
      return width >= 10 && height >= 10
    }

  }

  refreshSize () {
    this.resizeContainer()
    this.resizeImage()
  }


  get imageOrientation () {
    if(this.node) {
      return this.getRatio() < 1 ? 'portrait' : 'landscape'
    }
  }

  get allFixed () {

    return this.fixedHeight && this.fixedWidth;
  }

  getRatio ():number {
    if ( this.node && this.node.headers )
    {
      return this.node.headers.ratio || 1
    }
    return 1
  }

  getContainerBounds(){
    /*
    getBoundingClientRect() is also taking all transforms
    (e.g. scale, rotate,...) into account, sometimes
    that's not what we need
    */
   
   let size:ISize

   const scale:number = this.imageScale

    if (this.viewParams.useNativeDimensions) {
      size = {
        width: this.imageContainer.nativeElement.offsetWidth,
        height: this.imageContainer.nativeElement.offsetHeight
      }
    }
    else {
      size = this.imageContainer.nativeElement.getBoundingClientRect()
    }

    /*console.log('%s - container bounds - w: %s h: %s', this.node.cuid, size.width, size.height )
    console.log('scale: ', scale)*/

    return size
  }

  getContainerSize () {
    return roundSize ( this.getContainerBounds() )
  }

  protected resizeImage () {
    const contentSize = this.getContentSize()
    this.imageSize = contentSize
  }

  protected onResize () {

    this.refreshSize()
  }

  protected onNodeUpdate ( ) {
    
    if ( this.node && this.node.headers.color ) {
    
      this.updateContainerStyle({'background-color': this.node.headers.color})
      this._initialized.emit(true)

    }
    
    if ( this.node && this.node.modifiers.indexOf('force-highres') > -1 ) {
    
      this.forceHighResolution = true
    
    }

    if ( !this.scrollSubscription ) {
      this._initViewportLoading ()
    }


    super.onNodeUpdate()
  }

  protected onUpdate() {
    //super.onUpdate()
    this.imageData = this.data
    this.imageUrl = this.data ? this.data.url : undefined
    this.refreshSize()

    if ( this.isPreview )
    {
      this.isPreview = false
      this.logDebug ( 'did load preview for %s', this.node.cuid )
      //this.loadNodeContent()
    }
  }

  protected updateStyle ( target:string , props:any ) {
    const targetProp = this [ target+'Style' ]
    this[target+'Style'] = Object.assign ( {}, targetProp, props )
  }

  protected updateContainerStyle ( props:any ) {
    this.updateStyle ( 'container' , props )
    process.nextTick(()=>{
      this.containerSizeUpdates.emit(this.getContainerSize())
    })
  }

  /** hide until visible */

  public touchedViewport:boolean=this.moduleConfig.waitForViewport === false

  private scrollSubscription:Subscription

  private _initViewportLoading () {

    if ( this.waitForViewport === false || this.moduleConfig.waitForViewport === false ) {
      this.touchedViewport = true
      return
    }

    const cuid = this.node.cuid

    const t0 = performance.now()
    this.scrollSubscription = this.scrollService.registerComponent(this,[
        {
          position: MarginPosition.top
        }
      ],this.imageContainer ).map ( p => p.positions[0] )
    .filter ( pos => {
      return pos <= this.moduleConfig.viewportMargin
    } )
    .take ( 1 )
    .subscribe( (pos:number) => {
      this.touchedViewport = true
    } )
  }

  private _unsubscribeScroll () {
    this.scrollSubscription && this.scrollSubscription.unsubscribe ()
  }

  getContentSize () {
    const containerSize = this.getContainerSize()
    const ratio : number = this.getRatio()

    const contentSize:any = {}

    if ( this.allFixed )
    {
      contentSize.width = containerSize.width
      contentSize.height = containerSize.height || (containerSize.width / ratio)
    }
    else if ( this.fixedHeight )
    {
      contentSize.width = containerSize.height * ratio
      contentSize.height = containerSize.height
    }
    else
    {
      contentSize.width = containerSize.width
      contentSize.height = containerSize.width / ratio
    }
    return roundSize ( contentSize )
  }

  protected canLoadContentWithParams ( contentParams:any ):boolean {
    
    if ( !this.node ) {

      return false
      
    }

    const errors = []
    if ( contentParams.w < 10 )
    errors.push ( `Content parameter property w must be >= 10, but it is ${contentParams.w}` )
    if ( contentParams.h < 10 )
      errors.push ( `Content parameter property h must be >= 10, but it is ${contentParams.h}` )
    if ( errors.length > 0 && isDevMode() )
    {
      console.error('invalid content params for image %s: ', this.node.cuid, ...errors  )
    }
    return errors.length === 0
  }

  bounceSize ( contentSize:ISize ) {

    if ( this.viewParams.bouncing === false ) {
      return contentSize
    }
    if ( this.imageOrientation === 'portrait' && contentSize.width > SIZE_BOUNCE )
    {
      const previewWidth = contentSize.width + SIZE_BOUNCE - ( contentSize.width % SIZE_BOUNCE )
      const m = previewWidth / contentSize.width
      // console.log('%s:ImageComponent:bouncing portrait by m = %s', this.node.cuid, m)
      return {
        width: previewWidth,
        height: Math.floor(contentSize.height * m)
      }
    }
    else if ( this.imageOrientation !== 'portrait' && contentSize.height > SIZE_BOUNCE )
    {
      const previewHeight = contentSize.height + SIZE_BOUNCE - ( contentSize.height % SIZE_BOUNCE )
      const m = previewHeight / contentSize.height
      // console.log('%s:ImageComponent:bouncing landscape by m = %s', this.node.cuid, m)
      return {
        width: Math.floor(contentSize.width * m),
        height: previewHeight
      }
    }
    return contentSize

  }

  mapSizeToPreferredPreview ( contentSize:ISize ) {
    let size:ISize = this.bounceSize(contentSize)

    if ( this.isPreview ) {

      size = {
        width: size.width * this.getScale(),
        height: size.height * this.getScale()
      }

      this.logDebug ( 'preview size', size )

    } 

    return size

  }

  getContentParams(preferredSize?:ISize){
    let params = {
      w: preferredSize.width ,
      h: preferredSize.height ,
      dpr: this.getDPR() ,
      fit: this.allFixed ? 'crop' : 'clip',
      fm : 'jpg' // default fallback format
    }

    if (this.cropStrategy && typeof this.cropStrategy === 'string' ) {
      params['crop'] = this.cropStrategy
    }

    if (this.fallbackFormat && typeof this.fallbackFormat === 'string' ) {
      params['fm'] = this.fallbackFormat
    }

    if (this.fitStrategy && typeof this.fitStrategy === 'string' ) {
      params['fit'] = this.fitStrategy
    }

    return params
  }

  resizeContainer(){

    if ( this.allFixed )
    {
      // console.log('its all fixed', this.getContainerBounds().height)
      // nothing, we assume image-container has dimensions from parent component
    }
    else if ( this.fixedHeight )
    {
      // height was set by parent component, we need to calculate the width
      this.updateContainerStyle ( {
        height : 'auto',
        width: (this.getContainerSize().height * this.getRatio()) + 'px'
      } )
    }
    else
    {
      // width was set by parent component, we need to calculate the height
      this.updateContainerStyle ( {
        width: 'auto',
        height: (this.getContainerSize().width / this.getRatio()) + 'px'
      } )
    }
  }

  buildContentURL (contentParams:any={}):string {
    const imageUrl = urlUtils.parse(`${KIO_IMG_URL}/${this.node.cuid}/${this.localeService.currentLocale}`)
    imageUrl.query = contentParams
    return urlUtils.format(imageUrl)
  }

  loadContent():Observable<any> {
    const self = this
    const t0 = Date.now()
    return Observable.throw(`ImageComponent::loadContent() is deprecated`)
  }

  loadNodeContent(){
    if ( this.imageContainer )
    {
      this.refreshSize()
    }
  }

  protected onMounted () {
    if ( this.node ) {
      if ( !this.data ) {
        this.loadNodeContent()
      }
      this._initViewportLoading()
    }   
  }

  protected subscribeResizing () {
    this.resizeSubscription = this.resizing.subscribe(e => {
      this.onResize()
    });
  }

  ngOnInit(){
    this.isPreview = this.withPreview !== false
    this.logDebug ('component "%s" init with viewParams', this, this.viewParams, {
      isPreview: this.isPreview,
      scale: this.getScale(),
      ratio: this.getRatio()
    })
    this._initialized.emit(true)
    super.ngOnInit()
  }

  ngOnDestroy(){
    this._unsubscribeScroll()
    this.updateSubscription.unsubscribe()
    super.ngOnDestroy()
  }

  ngAfterViewInit(){
    //this.logDebug ('view of "%s" init with viewParams', this, this.viewParams)
    //console.log('ngAfterInit with viewParams', this.viewParams, '\n', this)
    this.subscribeResizing()
    super.ngAfterViewInit()
    if ( this.imageContainer )
    {
      process.nextTick(()=>{
        // some bug in angular makes this necessary
        this.onMounted()
      })
    }

  }

  private logDebug ( format:string, ...args:any[] ) {
    if ( isDevMode() && this.moduleConfig.debugging === true ) {
      console.group('Image:Debug')
      console.log(format,...args)
      console.groupEnd()
    }
  }

  protected getDPR ():number {
    if ( this._forceHighRes ) {
      return window.devicePixelRatio
    } else {
      return Math.min ( window.devicePixelRatio, this.moduleConfig.lowResolutionMaxDPR || LOW_RES_MAX_DPR )
    }
  }

}
