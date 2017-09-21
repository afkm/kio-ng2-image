import { NgModule } from '@angular/core'
import { KioNg2ComponentRoutingModule } from 'kio-ng2-component-routing'
import { KioCtnModule } from 'kio-ng2-ctn'
import { ImageComponent } from './components/image/image.component'

@NgModule({
  imports: [ KioNg2ComponentRoutingModule, KioCtnModule ],
  declarations: [ ImageComponent ],
  entryComponents: [ ImageComponent ],
  exports: [ KioNg2ComponentRoutingModule, ImageComponent, KioCtnModule ]
})
export class KioNg2ImageModule {}