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
import { SizeResolver } from '../../resolvers/size-resolver'

import { ImageWrapper } from '../../classes/image-wrapper.class'
import { ImageHeaders } from '../../interfaces/headers'



@Component({
  selector: 'publication-image',
  templateUrl: './canvas-image.component.html',
  styleUrls: [
    './canvas-image.component.scss'
  ]
})
export class CanvasImageComponent implements OnInit, AfterViewInit {

  constructor(
      protected backendService:BackendService,
      protected imageURLResolver:ImageURLResolver,
      protected sizeResolver:SizeResolver,
      protected imageURLOptionsResolver:ImageURLOptionsResolver,
      protected wrappedElement:ElementRef
    ) {

  }

  public canvasElementWidth:number

  public canvasElementHeight:number

  /** legacy parameters */

  @Input('withPreview') lgWithPreview:boolean

  @Input('initialScale') lgInitialScale:number=0.2

  /**
   * @brief      canvas element in template
   */
  @ViewChildren('canvas')
  canvasElement:QueryList<ElementRef>

  @ViewChildren('container')
  containerElement:QueryList<ElementRef>


  @Input() set node ( nodeValue:KioNode ) {
    console.log('update node', nodeValue)
    this.nodeEmitter.emit(nodeValue)
  }

  @Input('viewParams') set viewParamsInput ( viewParams:ImageOptions ) {

    this.viewParamsEmitter.emit({
      ...viewParams,
      withPreview: this.lgWithPreview || viewParams.withPreview
    })
  } 

  /** async emitters */

  protected nodeEmitter:EventEmitter<KioNode>=new EventEmitter()

  protected nodeOutput:Observable<KioNode>=this.nodeEmitter.filter(n => !!n).shareReplay(1)
  
  protected viewParamsEmitter:EventEmitter<ImageOptions>=new EventEmitter()
  
  protected viewParamsOutput:Observable<ImageOptions>=this.viewParamsEmitter.shareReplay(1)

  protected canvasElementEmitter:EventEmitter<HTMLCanvasElement>=new EventEmitter()
  
  protected containerElementEmitter:EventEmitter<HTMLDivElement>=new EventEmitter()


  /** observables */

  protected imageHeaders:Observable<ImageHeaders>=this.nodeOutput.map ( (node:KioNode):ImageHeaders => <any>node.headers )

  protected elementSize:Observable<Size>=Observable.zip(this.nodeOutput,this.viewParamsOutput,this.containerElementEmitter).mergeMap ( ([node,options,containerElement]:[KioNode,ImageOptions,HTMLDivElement]) => {
    return this.sizeResolver.resolve(containerElement,options,<ImageHeaders>node.headers)
  } )
  .distinctUntilChanged ( (sizeLeft:Size, sizeRight:Size) => {
    return (sizeLeft.width === sizeRight.width) && (sizeLeft.height === sizeRight.height)
  } )
  .filter ( (size:Size) => {
    return size.width >= 10 && size.height >= 10
  } ).shareReplay(1)

  protected imageURLOptions:EventEmitter<ImageURLOptions>=new EventEmitter()

  urlOptions:Observable<ImageURLOptions>=Observable.zip(this.elementSize,this.nodeOutput,this.viewParamsOutput)
  .map ( ([size,node,viewParams]:[Size,KioNode,ImageOptions]) => {
    return this.imageURLOptionsResolver.resolve ( size, viewParams, node )
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
    console.log('image url', url)
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
    this.canvasElementEmitter.emit(this.canvasElement.first.nativeElement)
    this.containerElementEmitter.emit(this.containerElement.first.nativeElement)
  }

}
