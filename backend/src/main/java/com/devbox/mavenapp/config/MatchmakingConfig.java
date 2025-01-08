package com.devbox.mavenapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import com.devbox.mavenapp.handler.ExampleHandler;
import javax.websocket.server.ServerEndpointConfig;

public class MatchmakingConfig {

    public static ServerEndpointConfig createWebSocketConfig() {
        return ServerEndpointConfig.Builder
            .create(MatchmakingWebSocketHandler.class, "/matchmaking")
            .build();
    }

    public static final String APPLICATION_SERVER_URL = "http://localhost:8080/api/matches";
}
