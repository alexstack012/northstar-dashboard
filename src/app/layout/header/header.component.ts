import { Component, output } from '@angular/core';
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [MatAnchor]
})
export class HeaderComponent {
  readonly logout = output<void>();
}
