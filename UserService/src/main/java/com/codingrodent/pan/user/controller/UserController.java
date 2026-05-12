package com.codingrodent.pan.user.controller;

import com.codingrodent.pan.user.dto.LoginRequestDto;
import com.codingrodent.pan.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static com.codingrodent.pan.user.constants.ServiceConstants.API_BASE;

@RestController
@RequestMapping(API_BASE)
@Validated
@Tag(name = "User", description = "User management endpoints")
public class UserController {

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Authenticate and obtain a JWT",
            parameters = @Parameter(name = "x-correlation-id", in = ParameterIn.HEADER, required = true, description = "Correlation ID for request tracing"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JWT returned",
                    content = @Content(schema = @Schema(type = "string", example = "eyJhbGci..."))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials", content = @Content)
    })
    @PostMapping("/login")
    public String login(@RequestHeader("x-correlation-id") String correlationId,
                        @Valid @RequestBody LoginRequestDto request) {
        log.debug("Login attempt for user: {}, correlationId: {}", request.username(), correlationId);
        return userService.login(request);
    }

}


