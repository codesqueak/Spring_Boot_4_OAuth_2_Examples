package com.codingrodent.pan.user.service;

import com.codingrodent.pan.user.constants.Roles;
import com.codingrodent.pan.user.dto.LoginRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.converter.RsaKeyConverters;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserServiceTest {

    private static RSAPrivateKey privateKey;
    private static RSAPublicKey publicKey;

    private UserService userService;

    @BeforeAll
    static void loadKeys() throws Exception {
        try (InputStream priv = new ClassPathResource("app.key").getInputStream();
             InputStream pub = new ClassPathResource("app.pub").getInputStream()) {
            privateKey = RsaKeyConverters.pkcs8().convert(priv);
            publicKey = RsaKeyConverters.x509().convert(pub);
        }
    }

    @BeforeEach
    void setUp() {
        userService = new UserService("http://localhost:9095", privateKey, publicKey);
    }

    @Test
    void login_success_returnsToken() {
        var token = userService.login(new LoginRequestDto("bob@codingrodent.com", "password1", "test-client"));
        assertThat(token).isNotBlank();
    }

    @Test
    void login_invalidCredentials_throwsBadCredentials() {
        assertThatThrownBy(() -> userService.login(new LoginRequestDto("unknown@example.com", "password", "test-client")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void generateTokenExample() throws Exception {
        var mapper = new ObjectMapper();
        var token = userService.generateToken("fred.bloggs@gmail.com", List.of(Roles.INTERACTIVE), "my-client-id");
        var parts = token.split("\\.");

        var headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        System.out.println("Header:");
        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(mapper.readTree(headerJson)));

        var claims = userService.extractAllClaims(token);
        System.out.println("Claims:");
        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(claims));
    }
}
