package com.devbox.mavenapp.unit.config;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;
import com.devbox.mavenapp.config.WebSocketConfig;
import com.devbox.mavenapp.handler.GameWebSocketHandler;
import com.devbox.mavenapp.handler.MatchmakingHandler;

public class WebSocketConfigTest {

    @Test
    public void testRegisterWebSocketHandlers() {
        // Arrange
        WebSocketConfig webSocketConfig = new WebSocketConfig();
        WebSocketHandlerRegistry registry = mock(WebSocketHandlerRegistry.class);
        WebSocketHandlerRegistration gameHandlerRegistration = mock(WebSocketHandlerRegistration.class);
        WebSocketHandlerRegistration matchmakingHandlerRegistration = mock(WebSocketHandlerRegistration.class);

        // Mock the handler registrations
        when(registry.addHandler(any(GameWebSocketHandler.class), eq("/game"))).thenReturn(gameHandlerRegistration);
        when(registry.addHandler(any(MatchmakingHandler.class), eq("/waiting"))).thenReturn(matchmakingHandlerRegistration);

        // Mock the chained calls for addInterceptors and setAllowedOrigins
        when(gameHandlerRegistration.addInterceptors(any())).thenReturn(gameHandlerRegistration);
        when(matchmakingHandlerRegistration.addInterceptors(any())).thenReturn(matchmakingHandlerRegistration);
        when(gameHandlerRegistration.setAllowedOrigins(any())).thenReturn(gameHandlerRegistration);
        when(matchmakingHandlerRegistration.setAllowedOrigins(any())).thenReturn(matchmakingHandlerRegistration);

        // Act
        webSocketConfig.registerWebSocketHandlers(registry);

        // Assert
        verify(registry).addHandler(any(MatchmakingHandler.class), eq("/waiting"));
        verify(registry).addHandler(any(GameWebSocketHandler.class), eq("/game"));
        verify(matchmakingHandlerRegistration).addInterceptors(any());
        verify(gameHandlerRegistration).addInterceptors(any());
        verify(matchmakingHandlerRegistration).setAllowedOrigins(any());
        verify(gameHandlerRegistration).setAllowedOrigins(any());
    }
}