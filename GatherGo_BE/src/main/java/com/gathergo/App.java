package com.gathergo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        FirebaseInitializer.initialize();
        SpringApplication.run(App.class, args);
    }
}
//SCHIMBARE DE TEST