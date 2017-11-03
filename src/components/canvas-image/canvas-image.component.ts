import { 
  Component, ViewChild, Inject, ElementRef, ViewChildren,
  Input,
  OnInit, OnDestroy, AfterViewInit,
  QueryList,
  EventEmitter
} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import 'rxjs/add/operator/map'

import { ImageOptions } from '../../interfaces/options'
import { ImageURLOptions } from '../../interfaces/url-options'
import { Size } from '../../interfaces/size'

import { BackendService } from 'kio-ng2-ctn'
import { KioNode } from 'kio-ng2-data'
import { ImageURLResolver } from '../../url-resolver/url-resolver'
import { ImageURLOptionsResolver } from '../../url-resolver/options-resolver'

import { ImageWrapper } from '../../classes/image-wrapper.class'


@Component({
  selector: 'kio-image-canvas',
  templateUrl: './canvas-image.component.html',
  styleUrls: [
    './canvas-image.component.scss'
  ]
})
export class CanvasImageComponent implements OnInit, AfterViewInit {

  constructor(
      protected backendService:BackendService,
      protected imageURLResolver:ImageURLResolver,
      protected imageURLOptionsResolver:ImageURLOptionsResolver,
      protected wrappedElement:ElementRef
    ) {

  }

  public canvasElementWidth:number

  public canvasElementHeight:number

  /**
   * @brief      canvas element in template
   */
  @ViewChildren('canvas')
  canvasElement:QueryList<ElementRef>

  @Input('viewParams') set viewParamsInput( options:ImageOptions ) {
    console.log('input viewParams', options)
    this.viewParamsEmitter.emit(options)
  }

  get viewParams():Observable<ImageOptions> {
    return this.viewParamsEmitter.asObservable().startWith({})
  }

  @Input() set node ( nodeValue:KioNode ) {
    this.nodeEmitter.emit(nodeValue)
  }

  protected nodeEmitter:EventEmitter<KioNode>=new EventEmitter()
  
  protected viewParamsEmitter:EventEmitter<ImageOptions>=new EventEmitter()

  protected canvasElementEmitter:EventEmitter<HTMLCanvasElement>=new EventEmitter()

  protected elementSize:Observable<Size>=Observable.interval().map ( k => {
    const el = this.wrappedElement.nativeElement
    const { width, height } = el.getBoundingClientRect()
    console.log('size', {width, height})
    return {
      width: Math.floor(width),
      height: Math.floor(height)
    }
  } )
  .distinctUntilChanged ( (sizeLeft:Size, sizeRight:Size) => {
    return (sizeLeft.width === sizeRight.width) && (sizeLeft.height === sizeRight.height)
  } )
  .filter ( (size:Size) => {
    return size.width >= 10 && size.height >= 10
  } )
  .first()

  protected imageURLOptions:EventEmitter<ImageURLOptions>=new EventEmitter()

  urlOptions:Observable<ImageURLOptions>=this.elementSize.withLatestFrom(
      this.nodeEmitter,
      this.viewParams
    ).map ( ([size,node,viewParams]:[Size,KioNode,ImageOptions]) => {

    return this.imageURLOptionsResolver.resolve ( this.wrappedElement, {
      cuid: node.cuid,
      locale: node.locale,
      ratio: node.headers.ratio || 1,
      ...viewParams
    } )
  }) 

  
  imageURLSource=this.urlOptions.map ( urlOptions => this.imageURLResolver.resolve(urlOptions) )

  protected image=new ImageWrapper(this.backendService)

  private _sizeSubscription=this.elementSize.subscribe ( size => {
    this.canvasElementWidth = size.width
    this.canvasElementHeight = size.height
  } )

  private _imageSubscription=this.image.load.withLatestFrom(this.canvasElementEmitter).subscribe ( ([image,canvasElement]:[ImageWrapper,HTMLCanvasElement]) => {
    image.renderToCanvas(canvasElement)
  } )

  imageURL:string

  //imageSource=this.image

  private _imageURLSourceSub=this.imageURLSource.delay(10).subscribe ( url => {
    this.image.url = url
    this.imageURL = url
  } )



  ngOnInit(){
    /*console.log('canvasElement', this.canvasElement)
    console.log('wrappedElement', this.wrappedElement)
    console.log('viewParams', this.viewParams)
    console.log('node', this.node)    */
  }

  ngAfterViewInit(){
    console.log('ngAfterViewInit::canvasElement', this.canvasElement)
    this.canvasElementEmitter.emit(this.canvasElement.first.nativeElement)
    this.canvasElement.changes.subscribe ( change => {
      console.log('canvas element changed', change )
    } )

  }

}
