import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, MapPin, LayoutDashboard, User, LogOut } from 'lucide-angular';
import { By } from '@angular/platform-browser';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavigationComponent],
      imports: [
        RouterTestingModule, // Simulates the routing system
        LucideAngularModule.pick({ MapPin, LayoutDashboard, User, LogOut })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    
    // Set a default required input
    fixture.componentRef.setInput('userRole', 'user');
    fixture.detectChanges();
  });

  it('should create the navigation bar', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct brand name', () => {
    const brandElement = fixture.debugElement.query(By.css('span.text-2xl')).nativeElement;
    expect(brandElement.textContent).toContain('GatherGo');
  });

  it('should show specific nav items for the "user" role', () => {
    // Current userRole is 'user' (set in beforeEach)
    const links = fixture.debugElement.queryAll(By.css('a'));
    // 1 logo link + 3 nav links (Trips, Create Trip, Profile) = 4 total
    expect(links.length).toBe(4);
  });
});