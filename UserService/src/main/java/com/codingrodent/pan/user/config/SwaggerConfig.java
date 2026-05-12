package com.codingrodent.pan.user.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SwaggerConfig implements WebMvcConfigurer {

    private static final Contact DEFAULT_CONTACT = new Contact().
            name("Admin").
            url("http://www.sleepymouse.co.uk").
            email("admin@sleepymouse.co.uk");

    private static final License DEFAULT_LICENCE = new License().
            name("The sleepymouse licence").
            url("http://www.sleepymouse.co.uk");

    private static final Info DEFAULT_INFO = new Info().
            contact(DEFAULT_CONTACT).
            description("User API").
            license(DEFAULT_LICENCE).
            title("User Service").
            version("0.0.1");

    @Bean
    public OpenAPI adminApi() {
        return new OpenAPI()
                .info(DEFAULT_INFO);
    }

}
