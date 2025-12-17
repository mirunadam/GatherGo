package com.gathergo.shared;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class FirebaseService {
    public String uploadImage(MultipartFile file) throws IOException {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String token = UUID.randomUUID().toString();

        Map<String, String> metadata = new HashMap<>();
        metadata.put("firebaseStorageDownloadTokens", token);

        Bucket bucket = StorageClient.getInstance().bucket();
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket.getName(), fileName)
                .setContentType(file.getContentType())
                .setMetadata(metadata)
                .build();

        bucket.getStorage().create(blobInfo, file.getBytes());

        String encodedPath = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return "https://firebasestorage.googleapis.com/v0/b/"
                        + bucket.getName()
                        + "/o/"
                        + encodedPath
                        + "?alt=media&token="
                        + token;
    }
}
