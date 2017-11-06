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
        
    const clientBounds = containerElement.nativeElement.parentElement.getBoundingClientRect()
    console.log('bounds of ', containerElement.nativeElement.parentElement, clientBounds)

    let size:Size = {
      width: clientBounds.width,
      height: clientBounds.height
    }

    let sizeOptions:SizeOptions = {

      left: 0,
      top: 0,
      right: 0,
      bottom: 0,

      fit: 'clip',

      scale: window.devicePixelRatio || 1,

      ...size
    }

    if ( options.fixedWidth ) {
      size = this.applyHorizontalConstraint(containerElement,options,headers)      
    } else if ( options.fixedHeight ) {
      size = this.applyVerticalConstraint(containerElement,options,headers)
    }

    this.applyElementStyles(containerElement.nativeElement, options, size)

    return Observable.of({...sizeOptions, ...size})
  }

  public applyElementStyles ( element:HTMLElement, options:ImageOptions, size:Size ) {

    if ( options.fixedHeight && options.fixedWidth ) {

      element.style.setProperty('position','absolute')

    }

    console.log('apply size to ', element, size )

    element.style.setProperty('width', `${size.width}px`)
    element.style.setProperty('height', `${size.height}px`)

  }

  public applyHorizontalConstraint ( containerElement:ElementRef, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      width
    } = containerElement.nativeElement.parentElement.getBoundingClientRect()

    return {
      width,
      height: Math.floor(width / ratio)
    }

  }


  public applyVerticalConstraint ( containerElement:ElementRef, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      height
    } = containerElement.nativeElement.parentElement.getBoundingClientRect()

    return {
      width: Math.floor(height * ratio),
      height
    }

  }


}