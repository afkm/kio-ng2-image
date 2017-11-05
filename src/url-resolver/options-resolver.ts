import { Injectable, ElementRef } from '@angular/core'
import { ImageURLOptions } from '../interfaces/url-options'
import { ImageOptions } from '../interfaces/options'
import * as urlUtil from 'url'
import * as querystring from 'querystring'
import { KioNode } from 'kio-ng2-data'


@Injectable()
export class ImageURLOptionsResolver {

  resolve ( container:ElementRef, options:ImageOptions, node:KioNode ):ImageURLOptions {

    console.log('options',options)

    const {
      width, height
    } = container.nativeElement.getBoundingClientRect()

    const size = {
      width,
      height
    }

    if ( options.fixedWidth !== true ) {

      size.height = size.width / node.headers.ratio

    }else if ( options.fixedHeight !== true ) {

      size.width = size.height * node.headers.ratio

    }

    const urlOptions:ImageURLOptions = {
      url: `https://kioget.37x.io/img/${node.cuid}/${node.locale||'de_DE'}`,
      w: Math.floor(size.width),
      h: Math.floor(size.height)
    }

    if ( options.fixedWidth && options.fixedHeight ) {
      urlOptions.fit = options.fit
    }

    return urlOptions

  }

}
