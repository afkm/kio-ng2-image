# kio-ng2-image

Provides image container for usage in digitorials. 
This module handles mapping of KioNode to image URL according to view dimensions.

## Config

```typescript
import { KioNg2ImageModule } from 'kio-ng2-image'

@NgModule({
  imports: [
    ...
    KioNg2ImageModule.forRoot ( {
      viewportMargin: 0.8,
      waitForViewport: true,
      activitySpinner: '/assets/images/spinner.svg',
      lowResolutionMaxDPR: 1.5
    } )
    ...
  ], ...
})
export class AppModule () {}

```

### viewportMargin `number`
*default: 1*

ScrollMargin value (see `kio-ng2-scrolling`) at which an image should start to load.  

0:  image top touches top of viewport  
1: image top touches bottom of viewport  
3: image is far away from visibile area  
<0: too late  



### waitForViewport `boolean` 
*default: false*

Hide images until they touch the viewport on the margin specified in `viewportMargin`



### activitySpinner `string`
*default: undefined*

Hide images until they touch the viewport on the margin specified in `viewportMargin`


### lowResolutionMaxDPR `number`

Maximum DPR to use for reducing image load size