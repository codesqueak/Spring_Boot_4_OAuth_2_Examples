package com.codingrodent.pan.user.service;

import com.codingrodent.pan.user.constants.Roles;
import com.codingrodent.pan.user.dto.LoginRequestDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;


@Service
public class UserService {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    private static final long EXPIRATION = 1000 * 60 * 60; // 1 hour
    private final String issuer;
    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;

    @Autowired
    public UserService(@Value("${spring.security.oauth2.authorizationserver.issuer}") String issuer,
                       RSAPrivateKey privateKey,
                       RSAPublicKey publicKey) {
        this.issuer = issuer;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public String login(LoginRequestDto request) {
        if ("bob@codingrodent.com".equals(request.username()) && "password1".equals(request.password())) {
            return generateToken(request.username(), List.of(Roles.ADMIN, Roles.INTERACTIVE), request.clientId());
        } else {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    public String generateToken(String username, List<Roles> roles, String clientId) {
        var scope = roles == null ? List.of() : roles.stream().map(Roles::name).toList();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(issuer)
                .subject(username)
                .claim("aud", clientId)
                .claim("scope", scope)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(privateKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
