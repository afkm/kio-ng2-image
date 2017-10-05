import { Component, OnInit } from '@angular/core';
import { KioContentModel } from 'kio-ng2-data'
import { ContentLoaderDirective } from 'kio-ng2-component-routing'


@Component({
  selector: 'app-image-test',
  templateUrl: './image-test.component.html',
  styleUrls: ['./image-test.component.scss'],
  providers: [ ContentLoaderDirective ]
})
export class ImageTestComponent implements OnInit {

  constructor() { }

  testNode:KioContentModel=new KioContentModel({
    cuid: 'cj1nej1wd000p3k5ws9854bxr',
    modifiers: ['image'],
    headers: {
      ratio: 939/700,
      color: '#fe3d2c'
    }
  })

  ngOnInit() {
  }

}
