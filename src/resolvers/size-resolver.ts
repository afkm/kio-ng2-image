import { Observable } from 'rxjs/Observable'

import { Injectable, ElementRef } from '@angular/core'
import { Size } from '../interfaces/size'
import { ImageOptions } from '../interfaces/options'
import { ImageHeaders } from '../interfaces/headers'
import { SizeOptions } from '../interfaces/size-options'
import { FitParameterType } from '../types/fit-parameter'


@Injectable()
export class SizeResolver {


  resolve ( containerElement:ElementRef, options:ImageOptions, headers:ImageHeaders ):Observable<SizeOptions> {
        
    const clientBounds = containerElement.nativeElement.getBoundingClientRect()

    const sizeOptions:SizeOptions = {

      left: 0,
      top: 0,
      right: 0,
      bottom: 0,

      fit: 'clip',

      scale: window.devicePixelRatio || 1,

      width: clientBounds.width,
      height: clientBounds.height
    }

    if ( options.fixedWidth ) {
      return Observable.of({
        ...sizeOptions,
        ...this.applyHorizontalConstraint(containerElement,options,headers)
      })
    } else if ( options.fixedHeight ) {
      return Observable.of({
        ...sizeOptions,
        ...this.applyVerticalConstraint(containerElement,options,headers)
      })
    }

    return Observable.of(sizeOptions)
  }

  public applyHorizontalConstraint ( containerElement:ElementRef, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      width
    } = containerElement.nativeElement.getBoundingClientRect()

    const height:number = Math.floor(width / ratio)

    const el:HTMLElement = containerElement.nativeElement
    el.style.setProperty('height',`${height}px`)

    return {
      width,
      height
    }

  }


  public applyVerticalConstraint ( containerElement:ElementRef, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      height
    } = containerElement.nativeElement.getBoundingClientRect()

    const width:number = Math.floor(height * ratio)

    const el:HTMLElement = containerElement.nativeElement
    el.style.setProperty('width',`${width}px`)

    return {
      width,
      height
    }

  }


}