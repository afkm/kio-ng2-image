import { Injectable } from '@angular/core'
import { ImageURLOptions } from '../interfaces/url-options'
import * as urlUtil from 'url'
import * as querystring from 'querystring'



@Injectable()
export class ImageURLResolver {

  resolve ( options:ImageURLOptions ) {

    const imageURL = urlUtil.parse(options.url)
    const {
      url,
      ...params
    } = options
    imageURL.query = querystring.stringify(params)
    imageURL.search = `?${imageURL.query}`
    return urlUtil.format(imageURL)

  }

}
