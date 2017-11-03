import { Inject } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import { BackendService } from 'kio-ng2-ctn'

export class ImageWrapper {

  constructor ( protected backend:BackendService ) {

    //this._image.src = url
    process.nextTick(()=>{
      this._observeEvents()
    })
  }

  public set url ( url:string ) {
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

  renderToCanvas ( canvas:HTMLCanvasElement ) {

    const context = canvas.getContext('2d')
    context.drawImage(this._image,0,0)

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