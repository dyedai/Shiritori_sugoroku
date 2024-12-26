package com.devbox.mavenapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import com.devbox.mavenapp.handler.GameWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new GameWebSocketHandler(), "/game")
                .setAllowedOrigins("*") // すべてのオリジンを許可
                .addInterceptors(new HttpSessionHandshakeInterceptor());
    }
}
