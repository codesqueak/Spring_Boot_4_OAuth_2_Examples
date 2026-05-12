package com.codingrodent.pan.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record LoginRequestDto(@JsonProperty("username") @NotNull String username,
                              @JsonProperty("password") @NotNull String password,
                              @JsonProperty("client_id") @NotNull String clientId) {
}
