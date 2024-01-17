import { Component, Input } from '@angular/core';
import { Similar } from '../models/similar';

@Component({
  selector: 'lms-similar',
  templateUrl: './similar.component.html',
  styleUrls: ['./similar.component.scss']
})
export class SimilarComponent {
  @Input() similar: Similar;
}