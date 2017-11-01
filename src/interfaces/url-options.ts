import { AutoParameterType } from '../types/auto-parameter'
import { CropParameterType } from '../types/crop-parameter'
import { ColorspaceParameterType } from '../types/colorspace-parameter'
import { FitParameterType } from '../types/fit-parameter'
import { FormatParameterType } from '../types/format-parameter'


export interface ImageURLOptions {
  /**
   * image url or relative path
   */
  url : string

  /**
   * source width 
   * 10 <= x => 3300
   */
  w : number

  /**
   * source height
   * 10 <= x => 3300
   */
  h : number

  /** 
   * The auto parameter helps to automate a baseline level of optimization 
   */
  auto ?: AutoParameterType|AutoParameterType[]

  /** 
   * Crop mode controls how the image is aligned when fit=crop is set
   */
  crop ?: CropParameterType|CropParameterType[]

  /**
   * color space; specifying the output 
   * https://docs.imgix.com/apis/url/format/cs
   * @default srgb
   */
  cs ?: ColorspaceParameterType

  /**
   * device pixel ratio
   * 0.5 <= x => 4.0
   * @default 1.0
   */  
  dpr ?: number

  /**
   * resize fit mode
   * @default clip
   */
  fit ?: FitParameterType

  /**
   * output format type
   */
  fm ?:FormatParameterType

  /**
   * output quality, if fm=jpg|pjpg|webp|jxr
   * 0 - 100
   * @default 75
   */
  q ?: number

  /**
   * sarturization of output
   * -100 <= x >= 100
   * @default 0
   */
  sat ?: number
}