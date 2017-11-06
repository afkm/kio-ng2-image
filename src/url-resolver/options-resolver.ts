import { Injectable, ElementRef } from '@angular/core'
import { ImageURLOptions } from '../interfaces/url-options'
import { ImageOptions } from '../interfaces/options'
import * as urlUtil from 'url'
import * as querystring from 'querystring'
import { KioNode } from 'kio-ng2-data'
import { Size } from '../interfaces/size'



@Injectable()
export class ImageURLOptionsResolver {

  resolve ( size:Size, options:ImageOptions, node:KioNode ):ImageURLOptions {

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
