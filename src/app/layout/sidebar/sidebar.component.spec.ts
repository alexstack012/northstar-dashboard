import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../core/services/auth.service';

describe('SidebarComponent', () => {
  it('hides the users link for non-admin users', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ role: 'recruiter' })
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems.some((item) => item.label === 'Users')).toBe(false);
  });

  it('shows the users link for admin users', async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ role: 'admin' })
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SidebarComponent);
    const component = fixture.componentInstance;

    expect(component.visibleNavItems.some((item) => item.label === 'Users')).toBe(true);
  });
});
