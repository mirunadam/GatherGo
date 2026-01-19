package com.gathergo.invites.controller;

import com.gathergo.invites.dto.InviteDto;
import com.gathergo.invites.dto.InviteStatus;
import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invites")
public class InvitesController {

    private final DatabaseReference dbRef =
            FirebaseDatabase.getInstance().getReference("invites");

    // =========================
    // GET ALL (not deleted)
    // =========================
    @GetMapping
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvites() {
        DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();

        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for (DataSnapshot inviteSnapshot : snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);

                    if (invite != null && !invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
                );
            }
        });

        return response;
    }

    // =========================
    // ACCEPT INVITE
    // =========================
    @PatchMapping("/{id}/accept")
    public ResponseEntity<Void> acceptInvite(@PathVariable String id) {
        dbRef.child(id).child("status").setValueAsync(InviteStatus.ACCEPTED.name());
        dbRef.child(id).child("deleted").setValueAsync(true);
        return ResponseEntity.ok().build();
    }

    // =========================
    // REJECT INVITE
    // =========================
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Void> rejectInvite(@PathVariable String id) {
        dbRef.child(id).child("status").setValueAsync(InviteStatus.REJECTED.name());
        dbRef.child(id).child("deleted").setValueAsync(true);
        return ResponseEntity.ok().build();
    }

    // =========================
    // GET BY SENDER
    // =========================
    @GetMapping("/sender/{email}")
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvitesBySenderEmail(
            @PathVariable String email
    ) {
        DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();

        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for (DataSnapshot inviteSnapshot : snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);

                    if (invite != null
                            && email.equals(invite.getSenderEmail())
                            && !invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
                );
            }
        });

        return response;
    }

    // =========================
    // GET BY RECEIVER
    // =========================
    @GetMapping("/receiver/{email}")
    public DeferredResult<ResponseEntity<List<InviteDto>>> getAllInvitesByReceiverEmail(
            @PathVariable String email
    ) {
        DeferredResult<ResponseEntity<List<InviteDto>>> response = new DeferredResult<>();

        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<InviteDto> invites = new ArrayList<>();

                for (DataSnapshot inviteSnapshot : snapshot.getChildren()) {
                    InviteDto invite = inviteSnapshot.getValue(InviteDto.class);

                    if (invite != null
                            && email.equals(invite.getReceiverEmail())
                            && !invite.isDeleted()) {
                        invites.add(invite);
                    }
                }

                response.setResult(ResponseEntity.ok(invites));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setResult(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
                );
            }
        });

        return response;
    }

    // =========================
    // CREATE INVITE
    // =========================
    @PostMapping
    public ResponseEntity<InviteDto> createInvite(@RequestBody InviteDto inviteDto) {

        if (inviteDto.getUuid() == null) {
            inviteDto.setUuid(UUID.randomUUID().toString());
        }

        if (inviteDto.getStatus() == null) {
            inviteDto.setStatus(InviteStatus.PENDING);
        }

        if (inviteDto!=null && !inviteDto.isDeleted()) {
            inviteDto.setDeleted(false);
        }

        ApiFuture<Void> future =
                dbRef.child(inviteDto.getUuid()).setValueAsync(inviteDto);

        try {
            future.get();
            return ResponseEntity.ok(inviteDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
