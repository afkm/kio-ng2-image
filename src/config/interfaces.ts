export interface KioNg2ImageModuleConfig {

  /**
   * path to activity indicator displayed while loading image; set to '' or undefined to use none
   * 
   * @default undefined
   */
  activitySpinner?: string

  /**
   * wait for image container to be in viewport; default: true
   */
  waitForViewport?: boolean

  /**
   * margin ratio to reach before loading images; default 1.2
   */
  viewportMargin?: number


  /**
   * maxmimum dpr to load images to reduce data
   * @default 1.5
   */
  lowResolutionMaxDPR?: number


  /**
   * enabled console output in development mode
   * @default false
   */
  debugging?: boolean


}