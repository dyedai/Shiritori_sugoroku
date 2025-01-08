package com.devbox.mavenapp.unit.handler;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.devbox.mavenapp.handler.GameWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GameWebSocketHandlerTest {
    // TODO: 単語の検索結果を検証できるようにする
    WebSocketSession session;
    GameWebSocketHandler handler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void beforeEach() {
        session = mock(WebSocketSession.class);
        handler = new GameWebSocketHandler();

        when(session.getId()).thenReturn("0");
    }

    @Test
    public void testHandleTextMessage() throws Exception {
        handler.afterConnectionEstablished(session);

        Map<String, Object> messageObj = new HashMap<>();
        messageObj.put("type", "checkWord");
        messageObj.put("word", "hoge");
        messageObj.put("playerId", 0);

        TextMessage message = new TextMessage(objectMapper.writeValueAsString(messageObj));

        handler.handleMessage(session, message);
    }

}
