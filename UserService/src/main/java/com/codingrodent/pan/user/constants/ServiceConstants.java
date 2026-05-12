package com.codingrodent.pan.user.constants;

public class ServiceConstants {
    // API Versions
    public final static String API_VERSION = "v1";
    public final static String API_BASE = "/user/" + API_VERSION;

    public final static String CID = "cid";
    public final static String CID_HEADER = "x-correlation-id";
    public final static String APP_NAME = "app";
    public final static String COMPONENT_NAME = "component";


    private ServiceConstants() {
        // Never need to make an instance of this class
    }
}
