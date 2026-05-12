package com.codingrodent.pan.user.constants;

public enum Roles {
    ROOT(1),
    ADMIN(2),
    INTERACTIVE(3);

    private final int value;

    Roles(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
