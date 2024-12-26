package com.devbox.mavenapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import com.devbox.mavenapp.handler.GameWebSocketHandler;
import com.devbox.mavenapp.handler.MatchmakingHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // MatchmakingHandler を "/waiting" エンドポイントに登録
        registry.addHandler(new MatchmakingHandler(), "/waiting")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .setAllowedOrigins("*");

        // GameWebSocketHandler を "/game" エンドポイントに登録
        registry.addHandler(new GameWebSocketHandler(), "/game")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .setAllowedOrigins("*");
    }
}
