import { Injectable, ElementRef } from '@angular/core'
import { ImageURLOptions } from '../interfaces/url-options'
import { ImageOptions } from '../interfaces/options'
import * as urlUtil from 'url'
import * as querystring from 'querystring'
import { KioNode } from 'kio-ng2-data'


@Injectable()
export class ImageURLOptionsResolver {

  resolve ( container:ElementRef, options:(ImageOptions&KioNode) ):ImageURLOptions {

    console.log('options',options)

    const {
      width, height
    } = container.nativeElement.getBoundingClientRect()

    const size = {
      width,
      height
    }

    if ( options.fixedWidth !== true ) {

      size.height = size.width / options.ratio

    }else if ( options.fixedHeight !== true ) {

      size.width = size.height * options.ratio

    }

    const urlOptions:ImageURLOptions = {
      url: `https://kioget.37x.io/img/${options.cuid}/${options.locale||'de_DE'}`,
      w: Math.floor(size.width),
      h: Math.floor(size.height)
    }

    if ( options.fixedWidth && options.fixedHeight ) {
      urlOptions.fit = options.fit
    }

    return urlOptions

  }

}
