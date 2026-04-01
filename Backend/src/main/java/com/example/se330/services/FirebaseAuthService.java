// services/FirebaseAuthService.java
package com.example.se330.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthService {

    public FirebaseToken verifyToken(String idToken) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    public String getUidFromToken(String idToken) throws Exception {
        return verifyToken(idToken).getUid();
    }
}