import { Inject } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import { BackendService } from 'kio-ng2-ctn'

import { Size } from '../interfaces/size'


export class ImageWrapper {

  constructor ( protected backend:BackendService ) {

    //this._image.src = url
    process.nextTick(()=>{
      this._observeEvents()
    })
  }

  public set url ( url:string ) {
    console.group('update image url')
    console.log('before', this._image.src)
    console.log('after', url)
    console.groupEnd()
    this._image.src = url
  }

  public get url ():string {
    return this._image.src
  }



  private _image:HTMLImageElement=new Image()



  progress:Observable<number>=Observable.fromEvent(this._image,'progress',(ev:ProgressEvent) => {
    return Math.min(ev.loaded / ev.total)
  })



  load:Observable<this>=Observable.fromEvent(this._image,'load',(ev:Event)=>this)


  size:Observable<Size>=this.load.map ( self => ({
    width: this._image.width,
    height: this._image.height
  }) )



  renderToCanvas ( canvas:HTMLCanvasElement ) {

    const context = canvas.getContext('2d')

    const leftOffset:number = (canvas.width - this._image.width) * 0.5
    const topOffset:number = (canvas.height - this._image.height) * 0.5
    const rightOffset:number = canvas.width - leftOffset
    const bottomOffset:number = canvas.height - topOffset
    context.drawImage(this._image,leftOffset,topOffset)

  }

  private _observeEvents () {

    this._image.addEventListener('loadstart',(ev:Event) => {
      console.log('image event "%s"', 'loadstart')
    })

    this._image.addEventListener('loadeddata',(ev:Event) => {
      console.log('image event "%s"', 'loadeddata')
    })

    this._image.addEventListener('load',(ev:Event) => {
      console.log('image event "%s"', 'load')
    })

    this._image.addEventListener('progress',(ev:Event) => {
      console.log('image event "%s"', 'progress')
    })

  }

}