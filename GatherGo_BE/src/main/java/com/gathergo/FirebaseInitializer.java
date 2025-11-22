package com.gathergo;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.FileInputStream;

public class FirebaseInitializer {
    public static void initialize() {
        try {
            FileInputStream serviceAccount =
                    new FileInputStream("src/main/resources/gathergo-9da0b-firebase-adminsdk-fbsvc-955a5f33c4.json");

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://your-project-id.firebaseio.com") // for Realtime DB
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized successfully");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
