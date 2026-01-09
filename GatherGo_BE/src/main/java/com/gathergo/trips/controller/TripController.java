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

//class handles http requests and returns JSON responses
@RestController
//all endpoints in this class will start with /api/trips
@RequestMapping("/api/trips")
public class TripController {
    DatabaseReference dbRef = FirebaseDatabase.getInstance().getReference("trips");
    //the connection to the database part we want to use
    //we are connected to the ,,folder" trips in the database using this

    @GetMapping()
    //this @GetMapping() will send a request of type GET/api/trips
    //because Firebase works asynchronously (it doesn’t return immediately
    public DeferredResult<ResponseEntity<List<TripDTO>>> getAllTrips() {
        //we get the list of trips wrapped in an HTTP response
        final DeferredResult<ResponseEntity<List<TripDTO>>> response = new DeferredResult<>();
        //a container which will hold the responses
        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
        //firebase call to get all trips under the trips node
        //addListenerForSingleValueEvent->fetch data once not continuously
            @Override
            public void onDataChange(DataSnapshot snapshot) {
            //this function will run when the Firebase will successfully fetch data
            //snapshot will contain all the trips from the FireBase
                List<TripDTO> trips = new ArrayList<>();
                //this was created to store trip objects

                //we will loop over all the child nodes in Firebase(the trips in my case)
                for(DataSnapshot tripSnapshot: snapshot.getChildren()) {
                    TripDTO trip = tripSnapshot.getValue(TripDTO.class);
                    //the json is converted into the TripDTO and then put in the trips list
                    trips.add(trip);
                }

                response.setResult(ResponseEntity.ok(trips));
                //when everything is ok we can send the list of trips as Json with http200 which means everything was ok
            }

            //if something failed we return a http500 to the frontend
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

    @PostMapping("/create")
    //@PostMapping("/create") → frontend sends POST /api/trips/create
    public ResponseEntity<TripDTO> createTrip(@RequestBody TripDTO tripDTO) {
    //@RequestBody TripDTO tripDTO → Spring maps JSON from frontend to TripDTO object automatically.
       ApiFuture<Void> future = this.dbRef.child(tripDTO.getUuid()).setValueAsync(tripDTO);
       //saves the trip asynchronously in FireBase under its uuid

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
