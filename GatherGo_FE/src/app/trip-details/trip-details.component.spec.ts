import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripDetailsComponent } from './trip-details.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

// ✅ Use your actual service import path
import { TripService } from '../trips/services/trip.service';

describe('TripDetailsComponent', () => {
  let component: TripDetailsComponent;
  let fixture: ComponentFixture<TripDetailsComponent>;

  let tripServiceSpy: jasmine.SpyObj<TripService>;
  let locationSpy: jasmine.SpyObj<Location>;

  const mockTrip: any = {
    uuid: 'abc-123',
    ownerEmail: 'test@example.com',
    dateStart: new Date('2025-01-01'),
    dateEnd: new Date('2025-01-05'),
    budget: 1000,
    currency: 'EUR',
    maxPeople: 4,
    itinerary: 'Day 1...',
    accommodation: 'Hotel...',
    imageURL: 'https://example.com/main.jpg',
    imageURLs: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    isPublic: true,
    participants: ['a@example.com', 'b@example.com'],
  };

  function makeActivatedRoute(uuid: string | null) {
    return {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'uuid' ? uuid : null),
        },
      },
    } as unknown as ActivatedRoute;
  }

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj<TripService>('TripService', ['getTripByUuid']);
    locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [TripDetailsComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: makeActivatedRoute('abc-123') },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call TripService.getTripByUuid with route uuid and set trip + arrays', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));

    fixture.detectChanges(); // triggers ngOnInit

    expect(tripServiceSpy.getTripByUuid).toHaveBeenCalledWith('abc-123');
    expect(component.trip).toEqual(mockTrip);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMsg).toBeNull();

    // These are optional depending on your TripDto; component defaults to []
    expect(Array.isArray(component.activities)).toBeTrue();
    expect(Array.isArray(component.accommodations)).toBeTrue();
    expect(Array.isArray(component.photos)).toBeTrue();
  });

  it('should set errorMsg if route uuid is missing and not call service', async () => {
    // Override ActivatedRoute for this test
    TestBed.resetTestingModule();

    tripServiceSpy = jasmine.createSpyObj<TripService>('TripService', ['getTripByUuid']);
    locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [TripDetailsComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(null) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(tripServiceSpy.getTripByUuid).not.toHaveBeenCalled();
    expect(component.trip).toBeNull();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMsg).toContain('Missing trip uuid');
  });

  it('should handle service error by setting errorMsg and clearing state', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(tripServiceSpy.getTripByUuid).toHaveBeenCalledWith('abc-123');
    expect(component.trip).toBeNull();
    expect(component.activities).toEqual([]);
    expect(component.accommodations).toEqual([]);
    expect(component.photos).toEqual([]);
    expect(component.likedPhotos.size).toBe(0);

    expect(component.isLoading).toBeFalse();
    expect(component.errorMsg).toBeTruthy();
  });

  it('goBack should call Location.back()', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));
    fixture.detectChanges();

    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('addActivity should push a new activity and reset form state', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));
    fixture.detectChanges();

    component.showActivityForm = true;
    component.newActivity = {
      id: '',
      name: 'Museum',
      description: 'Visit museum',
      date: '2025-01-02',
      time: '10:00',
    };

    component.addActivity();

    expect(component.activities.length).toBe(1);
    expect(component.activities[0].name).toBe('Museum');
    expect(component.activities[0].id).toBeTruthy(); // generated
    expect(component.showActivityForm).toBeFalse();
    expect(component.newActivity).toEqual({ id: '', name: '', description: '', date: '', time: '' });
  });

  it('addAccommodation should push a new accommodation and reset form state', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));
    fixture.detectChanges();

    component.showAccommodationForm = true;
    component.newAccommodation = {
      id: '',
      name: 'Hotel X',
      address: 'Main St',
      checkIn: '2025-01-01',
      checkOut: '2025-01-05',
      price: 200,
    };

    component.addAccommodation();

    expect(component.accommodations.length).toBe(1);
    expect(component.accommodations[0].name).toBe('Hotel X');
    expect(component.accommodations[0].id).toBeTruthy();
    expect(component.showAccommodationForm).toBeFalse();
    expect(component.newAccommodation).toEqual({
      id: '',
      name: '',
      address: '',
      checkIn: '',
      checkOut: '',
      price: 0,
    });
  });

  it('toggleLike should add/remove photoId from likedPhotos', () => {
    tripServiceSpy.getTripByUuid.and.returnValue(of(mockTrip));
    fixture.detectChanges();

    component.toggleLike('p1');
    expect(component.likedPhotos.has('p1')).toBeTrue();

    component.toggleLike('p1');
    expect(component.likedPhotos.has('p1')).toBeFalse();
  });
});
