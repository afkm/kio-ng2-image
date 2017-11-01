import { Injectable, ElementRef } from '@angular/core'
import { ImageURLOptions } from '../interfaces/url-options'
import { ImageOptions } from '../interfaces/options'
import * as urlUtil from 'url'
import * as querystring from 'querystring'
import { KioNode } from 'kio-ng2-data'


@Injectable()
export class ImageURLOptionsResolver {

  resolve ( container:ElementRef, options:(ImageOptions&KioNode) ):ImageURLOptions {

    const size = {
      width: container.nativeElement.clientWidth,
      height: container.nativeElement.clientHeight
    }

    if ( options.fixedWidth !== true ) {

      size.width = size.height * options.ratio

    }else if ( options.fixedHeight !== true ) {

      size.height = size.width / options.ratio

    }

    const urlOptions:ImageURLOptions = {
      url: `https://kioget.37x.io/src/${options.cuid}/${options.locale||'de_DE'}`,
      w: size.width,
      h: size.height
    }

    if ( options.fixedWidth && options.fixedHeight ) {
      urlOptions.fit = options.fit
    }

    return urlOptions

  }

}
