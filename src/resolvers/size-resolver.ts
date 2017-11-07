import { Observable } from 'rxjs/Observable'

import { Injectable } from '@angular/core'
import { Size } from '../interfaces/size'
import { ImageOptions } from '../interfaces/options'
import { ImageHeaders } from '../interfaces/headers'
import { SizeOptions } from '../interfaces/size-options'
import { FitParameterType } from '../types/fit-parameter'


@Injectable()
export class SizeResolver {

  elementSize ( element:HTMLElement, options:ImageOptions ):Size {

    if ( options.useNativeDimensions ) {
    
      return {
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    
    } else {
      
      const {
        width,
        height
      } = element.getBoundingClientRect()
      
      return {
        width,
        height
      }
    
    }

  }

  resolve ( containerElement:HTMLElement, options:ImageOptions, headers:ImageHeaders ):Observable<SizeOptions> {
        
    const clientBounds = this.elementSize(containerElement,options)
    
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
    
    if ( options.fixedWidth && options.fixedHeight ) {
      containerElement.style.setProperty('position','absolute')
    } else if ( options.fixedWidth ) {
      size = this.applyHorizontalConstraint(containerElement,options,headers)      
    } else if ( options.fixedHeight ) {
      size = this.applyVerticalConstraint(containerElement,options,headers)
    }

    //this.applyElementStyles(containerElement, options, size)

    containerElement.classList.add('initialized')

    return Observable.of({...sizeOptions, ...size})
  }

  public applyElementStyles ( element:HTMLElement, options:ImageOptions, size:Size ) {

    element.style.setProperty('width', `${size.width}px`)
    element.style.setProperty('height', `${size.height}px`)
  }

  public applyHorizontalConstraint ( containerElement:HTMLElement, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      width
    } = this.elementSize(containerElement,options)

    return {
      width,
      height: Math.floor(width / ratio)
    }

  }


  public applyVerticalConstraint ( containerElement:HTMLElement, options:ImageOptions, headers:ImageHeaders ) {

    const {
      ratio=1
    } = headers

    const {
      height
    } = this.elementSize(containerElement,options)

    return {
      width: Math.floor(height * ratio),
      height
    }

  }


}