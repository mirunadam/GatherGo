package com.gathergo.trips.controller;

import com.gathergo.trips.dto.TripDTO;
import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {
    DatabaseReference dbRef = FirebaseDatabase.getInstance().getReference("trips");

    @GetMapping()
    public DeferredResult<ResponseEntity<List<TripDTO>>> getAllTrips() {
        final DeferredResult<ResponseEntity<List<TripDTO>>> response = new DeferredResult<>();
        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<TripDTO> trips = new ArrayList<>();

                for(DataSnapshot tripSnapshot: snapshot.getChildren()) {
                    TripDTO trip = tripSnapshot.getValue(TripDTO.class);
                    trips.add(trip);
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

    @GetMapping("/{tripid}")
    public DeferredResult<ResponseEntity<TripDTO>> getTripById(@PathVariable String tripid) {
        final DeferredResult<ResponseEntity<TripDTO>> response = new DeferredResult<>();
        dbRef.child(tripid).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                response.setResult(ResponseEntity.ok(snapshot.getValue(TripDTO.class)));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping("/create")
    public ResponseEntity<TripDTO> createTrip(@RequestBody TripDTO tripDTO) {
       ApiFuture<Void> future = this.dbRef.child(tripDTO.getUuid()).setValueAsync(tripDTO);

       try {
           future.get();
           return ResponseEntity.ok(tripDTO);
       }
       catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
       }
    }
}
