import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TripDetailsComponent } from './trip-details.component';

describe('TripDetailsComponent', () => {
  let component: TripDetailsComponent;
  let fixture: ComponentFixture<TripDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TripDetailsComponent],
      imports: [FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailsComponent);
    component = fixture.componentInstance;

    component.trip = {
      name: 'Test Trip',
      location: 'Paris',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      budget: 1000,
      itinerary: 'Test itinerary',
      accommodation: 'Hotel',
    };

    component.user = { id: '1', name: 'User', email: 'u@test.com' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch tabs', () => {
    component.activeTab = 'activities';
    expect(component.activeTab).toBe('activities');
  });
});
