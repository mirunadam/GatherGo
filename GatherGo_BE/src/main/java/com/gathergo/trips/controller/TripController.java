package com.gathergo.trips.controller;

import com.gathergo.trips.dto.TripDTO;
import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//HttpStatus and ResponseEntity used to send resposes with status code to the frontend
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.ArrayList;
import java.util.List;
//@CrossOrigin(origins = "http://localhost:4200")
//class handles http requests and returns JSON responses
@RestController
//all endpoints in this class will start with /api/trips
@RequestMapping("/api/trips")
public class TripController {
    DatabaseReference dbRef = FirebaseDatabase.getInstance().getReference("trips");
    //the connection to the database part we want to use
    //we are connected to the "folder" trips in the database using this

    @GetMapping()
    //this @GetMapping() will send a request of type GET/api/trips
    //because Firebase works asynchronously (it doesn’t return immediately
    public DeferredResult<ResponseEntity<List<TripDTO>>> getAllTrips() {
        final DeferredResult<ResponseEntity<List<TripDTO>>> response = new DeferredResult<>();

        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<TripDTO> trips = new ArrayList<>();

                for (DataSnapshot tripSnapshot : snapshot.getChildren()) {
                    try {
                        TripDTO trip = tripSnapshot.getValue(TripDTO.class);

                        if (trip == null) {
                            System.err.println("Trip is null (failed mapping) for key=" + tripSnapshot.getKey());
                            continue;
                        }

                        if (trip.getUuid() == null) {
                            trip.setUuid(tripSnapshot.getKey());
                        }

                        trips.add(trip);
                    } catch (Exception e) {
                        System.err.println("Failed to map trip key=" + tripSnapshot.getKey() + " error=" + e.getMessage());
                        e.printStackTrace();
                        // skip this broken trip
                    }
                }

                response.setResult(ResponseEntity.ok(trips));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @GetMapping("/byOwner/{ownerEmail}")
    public DeferredResult<ResponseEntity<List<TripDTO>>> getAllTripsByOwner(@PathVariable String ownerEmail) {
        final DeferredResult<ResponseEntity<List<TripDTO>>> response = new DeferredResult<>();
        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<TripDTO> trips = new ArrayList<>();

                for(DataSnapshot tripSnapshot: snapshot.getChildren()) {
                    TripDTO trip = tripSnapshot.getValue(TripDTO.class);
                    if(ownerEmail.equals(trip.getOwnerEmail())) {
                        trips.add(trip);
                    }
                }

                response.setResult(ResponseEntity.ok(trips));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    //we get the Trip by using the tripId
    //same ideas as above
    @GetMapping("/{tripid}")
    public DeferredResult<ResponseEntity<TripDTO>> getTripById(@PathVariable String tripid) {
        //@PathVariable String tripid this will grab the tripId from the URL
        final DeferredResult<ResponseEntity<TripDTO>> response = new DeferredResult<>();
        dbRef.child(tripid).addListenerForSingleValueEvent(new ValueEventListener() {
        //we point to a specific child in the database base on the id
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                response.setResult(ResponseEntity.ok(snapshot.getValue(TripDTO.class)));
                //if ok we convert it into a TripDTo and put it in the response
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping("/addParticipant")
    public DeferredResult<ResponseEntity<TripDTO>> addParticipant(@RequestParam("uuid") String uuid, @RequestParam("email") String email) {
        final DeferredResult<ResponseEntity<TripDTO>> response = new DeferredResult<>();

        dbRef.child(uuid).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                TripDTO trip = dataSnapshot.getValue(TripDTO.class);
                if (trip == null) {
                    response.setResult(ResponseEntity.notFound().build());
                    return;
                }
                if(!trip.containsParticipant(email)) {
                    trip.addParticipant(email);
                    response.setResult(ResponseEntity.ok(createOrUpdateTrip(trip).getBody()));
                }
                else {
                    response.setResult(ResponseEntity.ok(trip));
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping("/addItineraryItem")
    public DeferredResult<ResponseEntity<TripDTO>> addItineraryItem(
            @RequestParam String uuid,
            @RequestParam String email,
            @RequestParam String item
    ) {
        final DeferredResult<ResponseEntity<TripDTO>> response = new DeferredResult<>();

        dbRef.child(uuid).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                TripDTO trip = snapshot.getValue(TripDTO.class);

                if (trip == null) {
                    response.setResult(ResponseEntity.notFound().build());
                    return;
                }

                if (!trip.canEditTrip(email)) {
                    response.setResult(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    return;
                }

                if (item == null || item.trim().isEmpty()) {
                    response.setResult(ResponseEntity.badRequest().build());
                    return;
                }

                trip.addItinerary(item.trim());
                response.setResult(createOrUpdateTrip(trip));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping("/addAccommodation")
    public DeferredResult<ResponseEntity<TripDTO>> addAccommodationSuggestion(
            @RequestParam String uuid,
            @RequestParam String email,
            @RequestParam String item
    ) {
        final DeferredResult<ResponseEntity<TripDTO>> response = new DeferredResult<>();

        dbRef.child(uuid).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                TripDTO trip = snapshot.getValue(TripDTO.class);

                if (trip == null) {
                    response.setResult(ResponseEntity.notFound().build());
                    return;
                }

                if (!trip.canEditTrip(email)) {
                    response.setResult(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    return;
                }

                if (item == null || item.trim().isEmpty()) {
                    response.setResult(ResponseEntity.badRequest().build());
                    return;
                }

                trip.addAccommodation(item.trim());
                response.setResult(createOrUpdateTrip(trip));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping("/create")
    public ResponseEntity<TripDTO> createOrUpdateTrip(@RequestBody TripDTO tripDTO) {
       ApiFuture<Void> future = this.dbRef.child(tripDTO.getUuid()).setValueAsync(tripDTO);

       try {
           future.get();
           //wits for firebase to confirm the write
           return ResponseEntity.ok(tripDTO);
           //if succesfull return http 200 OK
       }
       catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            //if not ok return the http 500
       }
    }
}
