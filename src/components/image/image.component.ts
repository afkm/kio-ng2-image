//import '../../../../debug'
import { isDevMode, Component, Input, ViewChild, ElementRef, Inject, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges, SimpleChange, ViewEncapsulation, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription, AsyncSubject, Observer, Scheduler } from 'rxjs'
import { KioContent, KioSrcData, KioContentState } from 'kio-ng2-data'
import { RoutableComponent, ContentDataComponent, ContentLoaderDirective, ResizingService } from 'kio-ng2-component-routing'
import { LocaleService } from 'kio-ng2-i18n'
import { BackendService, DataDirective } from 'kio-ng2-ctn'
import * as urlUtils from 'url'


const DEBOUNCE_RESIZE = 500
const SIZE_BOUNCE = 350
const KIO_IMG_URL = 'https://kioget.37x.io/img'


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

  protected localeService:LocaleService=this.injector.get(LocaleService)
  protected resizingService:ResizingService=this.injector.get(ResizingService)
  private resizeSubscription:Subscription

  /** option to initially render downscaled images   */
  @Input() withPreview:boolean=false
  @Input('initialScale') imageScale:number=0.2
  @Input('forceHighResolution') set forceHighResolution(highRes:boolean) {
    this._forceHighRes = highRes === true
  }

  get forceHighResolution ():boolean {
    return this._forceHighRes === true
  }

  @Output() load:EventEmitter<any>=new EventEmitter<any>()

  stateChageTimeout:number=5000

  private _forceHighRes:boolean
  private _initialized:EventEmitter<boolean>=new EventEmitter()

  getScale():number {
    return this.isPreview ? this.imageScale : 1
  }

  onLoadError ():void {
    this.data = null
    setTimeout(()=>this.loadNodeContent(),1000)
  }

  onImageLoadStart(event:any):void{
    this.updateContentState ( KioContentState.loading )
  }

  onImageLoad(event:any):void{
    this.updateContentState ( KioContentState.loaded )
    this.load.emit()
    if ( this.isPreview )
    {
      this.isPreview = false
      this.imageScale = 1
      this.refreshSize()
    }
    //console.log('image loaded', event)
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


  isPreview:boolean=this.withPreview

  imageUrl:string

  imageData:any;
  imgStyle:any={}
  containerStyle:any={}

  imageSizeChanges:EventEmitter<ISize>=new EventEmitter()
  containerSizeUpdates:EventEmitter<ISize>=new EventEmitter()


  protected _imageSize:any={};

  set imageSize ( size:any ) {
    size = roundSize ( size )
    this.imageSizeChanges.emit(size)
  }


  resizing:Observable<{width:number,height:number}>=this.resizingService.resize

  sizeUpdates=this.imageSizeChanges
    .skipUntil ( this._initialized )
    .map ( applyScale(this.getScale()) )
    .map ( roundSize )
    .distinctUntilChanged(
      (left,right)=>( left.width === right.width ) && ( left.height === right.height )
    )



  paramUpdate=this.sizeUpdates
    .map ( size => this.mapSizeToPreferredPreview(size) )
    .map ( roundSize )
    .map ( size => {
      return this.getContentParams(size)
    } )
    .filter ( contentParams => this.canLoadContentWithParams(contentParams) )

  imageURLUpdate=this.paramUpdate.map ( params => this.buildContentURL(params) )


  updateSubscription=this.imageURLUpdate
    .subscribe ( imageURL => {
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
    return this.imageContainer.nativeElement.getBoundingClientRect()
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
    if ( this.node && this.node.headers.color )
    {
      this.updateContainerStyle({'background-color': this.node.headers.color})
      this._initialized.emit(true)
    }
    if ( this.node && this.node.modifiers.indexOf('force-highres') > -1 ) {
      this.forceHighResolution = true
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

  getContentSize () {
    const containerSize = this.getContainerSize()
    const ratio : number = this.getRatio()

    const contentSize:any = {}

    // console.log('fixedHeight is ', this.fixedHeight)

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

  mapSizeToPreferredPreview ( contentSize:{width:number,height:number} ) {
    if ( this.imageOrientation === 'portrait' && contentSize.width > SIZE_BOUNCE )
    {
      const previewWidth = contentSize.width - ( contentSize.width % SIZE_BOUNCE )
      const m = previewWidth / contentSize.width
      return {
        width: previewWidth,
        height: Math.floor(contentSize.height * m)
      }
    }
    else if ( this.imageOrientation !== 'portrait' && contentSize.height > SIZE_BOUNCE )
    {
      const previewHeight = contentSize.height - ( contentSize.height % SIZE_BOUNCE )
      const m = previewHeight / contentSize.height
      return {
        width: Math.floor(contentSize.width * m),
        height: previewHeight
      }
    }
    return contentSize
  }

  getContentParams(preferredSize?:ISize){
    let params = {
      w: preferredSize.width ,
      h: preferredSize.height ,
      dpr: this._forceHighRes ? window.devicePixelRatio : 1 ,
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
    if ( !this.data && this.node )
    {
      this.loadNodeContent()
    }
  }

  protected subscribeResizing () {
    this.resizeSubscription = this.resizing.subscribe(e => {
      this.onResize()
    });
  }

  ngOnInit(){
    this._initialized.emit(true)
    super.ngOnInit()
  }

  ngOnDestroy(){
    this.updateSubscription.unsubscribe()
    super.ngOnDestroy()
  }

  ngAfterViewInit(){
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


}
