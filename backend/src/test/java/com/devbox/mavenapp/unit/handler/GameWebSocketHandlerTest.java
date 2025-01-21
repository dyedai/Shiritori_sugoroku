package com.devbox.mavenapp.handler;

import com.devbox.mavenapp.model.GameMessage;
import com.devbox.mavenapp.model.GameState;
import com.devbox.mavenapp.model.Player;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GameWebSocketHandlerTest {

    private GameWebSocketHandler handler;
    private ObjectMapper objectMapper;
    private WebSocketSession session1;
    private WebSocketSession session2;

    @BeforeEach
    void setUp() {
        handler = new GameWebSocketHandler();
        objectMapper = new ObjectMapper();

        session1 = mock(WebSocketSession.class);
        session2 = mock(WebSocketSession.class);
        
        when(session1.getId()).thenReturn("session1");
        when(session2.getId()).thenReturn("session2");
    }

    @Test
    void testAfterConnectionEstablished() throws Exception {
        //handler.afterConnectionEstablished(session1);
        joinPlayer(session1,0);

        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertTrue(sessions.containsKey("session1"), "Session should be added");
        assertEquals(1, sessions.size(), "Session count should be 1");

        List<Player> players = getHandlerPlayers();
        assertEquals(1, players.size(), "One player should be added");
        assertEquals(0, players.get(0).getId(), "Player ID should be 0");
    }

    @Test
    void testHandleTextMessage_CheckWord_Valid() throws Exception {
        //handler.afterConnectionEstablished(session1);
        joinPlayer(session1,0);

        GameMessage gameMessage = new GameMessage();
        gameMessage.setType("checkWord");
        gameMessage.setWord("りんご");
        gameMessage.setPlayerId(0);

        String payload = objectMapper.writeValueAsString(gameMessage);
        TextMessage textMessage = new TextMessage(payload);

        //GameWebSocketHandler spyHandler = Mockito.spy(handler);
        //doReturn(true).when(spyHandler).validateWordWithWeblio("example");

        handler.handleTextMessage(session1, textMessage);

        List<Player> players = getHandlerPlayers();
        assertEquals("りんご".length(), players.get(0).getPosition(), "Player position should update");
        assertTrue(getHandlerWordHistory().contains("りんご"), "Word should be added to history");
    }

    @Test
    void testHandleTextMessage_CheckWord_Invalid() throws Exception {
        //handler.afterConnectionEstablished(session1);
        joinPlayer(session1,0);

        GameMessage gameMessage = new GameMessage();
        gameMessage.setType("checkWord");
        gameMessage.setWord("あぴそ");
        gameMessage.setPlayerId(0);

        String payload = objectMapper.writeValueAsString(gameMessage);
        TextMessage textMessage = new TextMessage(payload);

        //GameWebSocketHandler spyHandler = Mockito.spy(handler);
        //doReturn(false).when(spyHandler).validateWordWithWeblio("invalidword123");

        handler.handleTextMessage(session1, textMessage);

        List<Player> players = getHandlerPlayers();
        assertEquals(0, players.get(0).getPosition(), "Player position should not update");
        assertFalse(getHandlerWordHistory().contains("あぴそ"), "Word should not be added to history");
    }

    @Test
    void testBroadcastState() throws Exception {
        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        verify(session1, atLeast(1)).sendMessage(any(TextMessage.class));
        verify(session2, atLeast(1)).sendMessage(any(TextMessage.class));
    }

    @Test
    void testAfterConnectionClosed() throws Exception {
        handler.afterConnectionEstablished(session1);
        handler.afterConnectionClosed(session1, null);

        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertFalse(sessions.containsKey("session1"), "Session should be removed");
    }

    private void joinPlayer(WebSocketSession session, int id) throws Exception {
        GameMessage joinMessage = new GameMessage();
        joinMessage.setType("join");
        joinMessage.setWord("Player1");
        joinMessage.setPlayerId(id);

        String payload = objectMapper.writeValueAsString(joinMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.afterConnectionEstablished(session);
        handler.handleTextMessage(session, new TextMessage(payload));
    }

    private ConcurrentHashMap<String, WebSocketSession> getHandlerSessions() throws Exception {
        return (ConcurrentHashMap<String, WebSocketSession>) getField(handler, "sessions");
    }

    private List<Player> getHandlerPlayers() throws Exception {
        return (List<Player>) getField(handler, "players");
    }

    private List<String> getHandlerWordHistory() throws Exception {
        return (List<String>) getField(handler, "wordHistory");
    }

    private Object getField(Object target, String fieldName) throws Exception {
        var field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(target);
    }
}
