package com.codingrodent.pan.user.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

import static com.codingrodent.pan.user.constants.ServiceConstants.CID;
import static com.codingrodent.pan.user.constants.ServiceConstants.CID_HEADER;


@Component
public class MDCInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String cid = request.getHeader(CID_HEADER);
        if (cid == null || cid.isEmpty()) {
            cid = UUID.randomUUID().toString();
        }
        MDC.put(CID, cid);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        MDC.remove(CID);
    }
}
