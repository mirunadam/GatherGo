package com.gathergo.invites.controller;

import com.gathergo.invites.dto.InviteDto;
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
@RequestMapping("/api/invites")
public class InvitesController {
    DatabaseReference dbRef = FirebaseDatabase.getInstance().getReference("invites");

    @GetMapping()
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvites() {
        final DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();
        Query q = dbRef.limitToLast(15);
        q.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for(DataSnapshot inviteSnapshot: snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);
                    if(!invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @GetMapping("/sender/{email}")
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvitesBySenderEmail(@PathVariable String email) {
        final DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();

        Query q = dbRef.limitToLast(20);
        q.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for(DataSnapshot inviteSnapshot: snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);
                    if(email.equals(invite.getSenderEmail()) && !invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @GetMapping("/receiver/{email}")
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvitesByReceiverEmail(@PathVariable String email) {
        final DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();

        Query q = dbRef.limitToLast(10);
        q.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for(DataSnapshot inviteSnapshot: snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);
                    if(email.equals(invite.getReceiverEmail()) && !invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            }
        });

        return response;
    }

    @PostMapping()
    public ResponseEntity<InviteDto> createOrUpdateInvite(@RequestBody InviteDto inviteDto) {
        ApiFuture<Void> future = this.dbRef.child(inviteDto.getUuid()).setValueAsync(inviteDto);

        try {
            future.get();
            return ResponseEntity.ok(inviteDto);
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<String> clearInvites(@RequestBody List<String> uuidList) {
        for(String uuid: uuidList) {
            dbRef.child(uuid).addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    InviteDto invite = snapshot.getValue(InviteDto.class);
                    invite.setDeleted(true);
                    dbRef.child(uuid).setValueAsync(invite);
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            });
        }

        return ResponseEntity.ok().build();
    }
}
