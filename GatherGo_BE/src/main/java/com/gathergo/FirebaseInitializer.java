package com.gathergo;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.File;
import java.io.FileInputStream;

public class FirebaseInitializer {
    public static void initialize() {
        try {
            FileInputStream serviceAccount =
                    new FileInputStream("GatherGo_BE/src/main/resources/gathergo-9da0b-firebase-adminsdk-fbsvc-955a5f33c4.json");

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    //.setDatabaseUrl("https://gathergo-9da0b-default-rtdb.firebaseio.com") // for Realtime DB
                    .setDatabaseUrl("https://gathergo-9da0b-default-rtdb.europe-west1.firebasedatabase.app") // for Realtime DB
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized successfully");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
