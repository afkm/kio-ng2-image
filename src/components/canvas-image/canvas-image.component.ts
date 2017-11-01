import { 
  Component, ViewChild, Inject, ElementRef, ViewChildren,
  Input,
  OnInit, OnDestroy, AfterViewInit,
  QueryList,
  EventEmitter
} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'

import { ImageOptions } from '../../interfaces/options'
import { ImageURLOptions } from '../../interfaces/url-options'
import { KioNode } from 'kio-ng2-data'
import { ImageURLResolver } from '../../url-resolver/url-resolver'
import { ImageURLOptionsResolver } from '../../url-resolver/options-resolver'

@Component({
  selector: 'kio-image-canvas',
  templateUrl: './canvas-image.component.html',
  styleUrls: [
    './canvas-image.component.scss'
  ]
})
export class CanvasImageComponent implements OnInit, AfterViewInit {

  constructor(
      protected imageURLResolver:ImageURLResolver,
      protected imageURLOptionsResolver:ImageURLOptionsResolver,
      protected wrappedElement:ElementRef
    ) {

  }

  @ViewChildren('canvas')
  canvasElement:QueryList<ElementRef>

  @Input() viewParams:ImageOptions
  @Input() node:KioNode

  protected canvasElementEmitter:EventEmitter<ElementRef>=new EventEmitter()

  protected imageURLOptions:EventEmitter<ImageURLOptions>=new EventEmitter()

  urlOptions:Observable<ImageURLOptions>=this.canvasElementEmitter.map ( element => {
    return this.imageURLOptionsResolver.resolve ( element, {
      ...this.node,
      ...this.viewParams
    } )
  }) 

  
  imageURLSource=this.urlOptions.map ( urlOptions => this.imageURLResolver.resolve(urlOptions) )

  imageURL:string

  /*private _imageURLSourceSub=this.imageURLSource.subscribe ( url => {
    this.imageURL = url
  } )*/



  ngOnInit(){
    console.log('canvasElement', this.canvasElement)
    console.log('wrappedElement', this.wrappedElement)
    console.log('viewParams', this.viewParams)
    console.log('node', this.node)    
  }

  ngAfterViewInit(){
    this.canvasElementEmitter.emit(this.canvasElement.first)
    this.canvasElement.changes.subscribe ( change => {
      console.log('canvas element changed', change )
    } )

  }

}
