package com.gathergo.shared.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CurrencyCode {
    RON("Ron"),
    EURO("Euro"),
    DOLLAR("Dollar");

    private final String currency;

    private CurrencyCode(String currency) {
        this.currency = currency;
    }

    @JsonValue
    public String getValue() {
        return currency;
    }

    @JsonCreator
    public static CurrencyCode fromValue(String value) {
        for (CurrencyCode c : values()) {
            if (c.currency.equalsIgnoreCase(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown currency: " + value);
    }
}
