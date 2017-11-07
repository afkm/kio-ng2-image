import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { KioNg2ImageModule } from '../../src/module';
import { ImageTestComponent } from './components/image-test/image-test.component';
import { EditableImageTestComponent } from './components/editable-image-test/editable-image-test.component'


@NgModule({
  declarations: [
    AppComponent,
    ImageTestComponent,
    EditableImageTestComponent
  ],
  imports: [
    BrowserModule,
    KioNg2ImageModule.forRoot({
      waitForViewport: false
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
