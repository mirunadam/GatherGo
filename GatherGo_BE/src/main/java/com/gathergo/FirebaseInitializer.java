package com.gathergo;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
@Service
public class FirebaseInitializer {
    @PostConstruct
    public static void initialize() {
        try {
            if(!FirebaseApp.getApps().isEmpty()){
                System.out.println("Firebase already initialised");
                return;
            }
            InputStream serviceAccount = FirebaseInitializer.class.getClassLoader()
                    .getResourceAsStream("Add what u need here");

            if (serviceAccount == null) {
                System.err.println("CRITICAL: Firebase JSON file not found in resources folder!");
                return;
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    //.setDatabaseUrl("https://gathergo-9da0b-default-rtdb.firebaseio.com") // for Realtime DB
                    .setDatabaseUrl("https://gathergo-9da0b-default-rtdb.europe-west1.firebasedatabase.app") // for Realtime DB
                    .setStorageBucket("gathergo-9da0b.firebasestorage.app")
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase initialized successfully");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}