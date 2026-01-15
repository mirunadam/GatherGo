package com.gathergo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
//@RestControllerAdvice->tells this class to watch all the controllers for errors and to handle them globally
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    //we handle in this class all the bad requests that we can get
    //if a bad request happens,no matter where it is,we need to run this exact test
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)//we return a http status 400which means a bad request
                .body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)//catches all other errors like fallbacks for example
                .body("Something went wrong: " + ex.getMessage());
    }
}
