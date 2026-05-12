package com.codingrodent.pan.user.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final MDCInterceptor mdcInterceptor;

    public WebConfig(MDCInterceptor mdcInterceptor) {
        this.mdcInterceptor = mdcInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(mdcInterceptor);
    }

    /**
     * springdoc-openapi 2.x returns byte[] from /v3/api-docs with produces=application/json.
     * Without this, MappingJackson2HttpMessageConverter base64-encodes the bytes.
     * Inserting ByteArrayHttpMessageConverter at position 0 ensures it is selected before
     * Jackson and writes the raw bytes (already serialized JSON) directly to the response.
     */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        ByteArrayHttpMessageConverter converter = new ByteArrayHttpMessageConverter();
        converter.setSupportedMediaTypes(List.of(MediaType.APPLICATION_JSON, MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
        converters.addFirst(converter);
    }

}