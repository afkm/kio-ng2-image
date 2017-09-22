import { NgModule } from '@angular/core'
import { KioNg2ComponentRoutingModule } from 'kio-ng2-component-routing'
import { KioCtnModule } from 'kio-ng2-ctn'
import { ImageComponent } from './components/image/image.component'
import { KioNg2i18nModule } from 'kio-ng2-i18n'


@NgModule({
  imports: [ KioNg2ComponentRoutingModule, KioCtnModule, KioNg2i18nModule ],
  declarations: [ ImageComponent ],
  entryComponents: [ ImageComponent ],
  exports: [ KioNg2ComponentRoutingModule, ImageComponent, KioCtnModule, KioNg2i18nModule ]
})
export class KioNg2ImageModule {}