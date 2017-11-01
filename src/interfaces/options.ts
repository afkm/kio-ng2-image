import { AutoParameterType } from '../types/auto-parameter'
import { CropParameterType } from '../types/crop-parameter'
import { ColorspaceParameterType } from '../types/colorspace-parameter'
import { FitParameterType } from '../types/fit-parameter'
import { FormatParameterType } from '../types/format-parameter'


export interface ImageOptions {

  /**
   * if set to true, the DOMElement`s width is used 
   */
  fixedWidth?:boolean

  /**
   * if set to true, the DOMElement`s height is used 
   */
  fixedHeight?:boolean

  ratio:number

  fit?: FitParameterType

  withPreview?:true

  initialScale?:number

  forceHighResolution?:boolean

  waitForViewport?: boolean

}