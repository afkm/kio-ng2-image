import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLoaderDirective } from 'kio-ng2-component-routing'

import { ImageTestComponent } from './image-test.component';

import { KioNg2ImageModule } from '../../../../src/module'

describe('ImageTestComponent', () => {
  let component: ImageTestComponent;
  let fixture: ComponentFixture<ImageTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ KioNg2ImageModule.forRoot ( {
        waitForViewport: true
      } ) ],
      declarations: [  ImageTestComponent ],
      providers: [ContentLoaderDirective]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
