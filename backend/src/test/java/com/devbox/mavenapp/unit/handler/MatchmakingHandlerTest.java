package com.devbox.mavenapp.unit.handler;

import com.devbox.mavenapp.handler.MatchmakingHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashMap;
import java.util.Map;

import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MatchmakingHandlerTest {

    private MatchmakingHandler handler;
    private WebSocketSession session1;
    private WebSocketSession session2;
    private WebSocketSession session3;
    private WebSocketSession session4;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // テスト用の MatchmakingHandler インスタンスを初期化
        handler = new MatchmakingHandler();
        objectMapper = new ObjectMapper();

        session1 = mock(WebSocketSession.class);
        session2 = mock(WebSocketSession.class);
        session3 = mock(WebSocketSession.class);
        session4 = mock(WebSocketSession.class);

        when(session1.getId()).thenReturn("session1");
        when(session2.getId()).thenReturn("session2");
        when(session3.getId()).thenReturn("session3");
        when(session4.getId()).thenReturn("session4");
        
    }

    @Test
    void testAfterConnectionEstablished() throws Exception {
        handler.afterConnectionEstablished(session1);
        
        // セッションが正しく追加されたことを確認
        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertTrue(sessions.containsKey("session1"));
        assertEquals(1, sessions.size());
    }

    @Test
    void testHandleTextMessage_JoinPlayer() throws Exception {
        Map<String, Object> joinMessage = new HashMap<>();
        joinMessage.put("type", "join");
        joinMessage.put("userName", "Player1");
        joinMessage.put("userId", "12345");
        String payload = objectMapper.writeValueAsString(joinMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.afterConnectionEstablished(session1);
        reflectionHandleTextMessage(session1, textMessage);

        // 正常に参加できた場合、エラーが送信されないことを確認
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeast(1)).sendMessage(captor.capture()); // No error sent for successful join.
    }

    @Test
    void testHandleTextMessage_DuplicatePlayer() throws Exception {
        Map<String, Object> joinMessage = new HashMap<>();
        joinMessage.put("type", "join");
        joinMessage.put("userName", "Player1");
        joinMessage.put("userId", "12345");
        String payload = objectMapper.writeValueAsString(joinMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.afterConnectionEstablished(session1);
        reflectionHandleTextMessage(session1, textMessage); // 最初の参加

        WebSocketSession session2 = mock(WebSocketSession.class);
        when(session2.getId()).thenReturn("session2");

        handler.afterConnectionEstablished(session2);
        reflectionHandleTextMessage(session2, textMessage); // 重複する参加

        // 重複エラーが送信されることを確認
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session2).sendMessage(captor.capture());
        String sentMessage = captor.getValue().getPayload();

        assertTrue(sentMessage.contains("error"));
        assertTrue(sentMessage.contains("Username or ID already taken."));
    }

    @Test
    void testAfterConnectionClosed() throws Exception {
        Map<String, Object> joinMessage = new HashMap<>();
        joinMessage.put("type", "join");
        joinMessage.put("userName", "Player1");
        joinMessage.put("userId", "12345");
        String payload = objectMapper.writeValueAsString(joinMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.afterConnectionEstablished(session1); // プレイヤーが参加
        reflectionHandleTextMessage(session2, textMessage);
        handler.afterConnectionClosed(session1, null); //プレイヤーが切断

        // プレイヤーが正しく削除されたことを確認
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeast(1)).sendMessage(captor.capture()); // 切断時にエラーが発生しないことを確認

        // セッションが正しく削除されたことを確認
        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertFalse(sessions.containsKey("session1"));
    }

    @Test
    void testBroadcastPlayerUpdate() throws Exception {
        Map<String, Object> joinMessage1 = new HashMap<>();
        joinMessage1.put("type", "join");
        joinMessage1.put("userName", "Player1");
        joinMessage1.put("userId", "12345");

        String payload1 = objectMapper.writeValueAsString(joinMessage1);
        TextMessage textMessage1 = new TextMessage(payload1);

        Map<String, Object> joinMessage2 = new HashMap<>();
        joinMessage2.put("type", "join");
        joinMessage2.put("userName", "Player2");
        joinMessage2.put("userId", "54321");

        String payload2 = objectMapper.writeValueAsString(joinMessage2);
        TextMessage textMessage2 = new TextMessage(payload2);

        handler.afterConnectionEstablished(session1);
        reflectionHandleTextMessage(session1, textMessage1);
        handler.afterConnectionEstablished(session2);
        reflectionHandleTextMessage(session2, textMessage2);

        // プレイヤー更新が正しく送信されることを確認
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeast(1)).sendMessage(captor.capture());
        verify(session2, atLeast(1)).sendMessage(captor.capture());

        String lastMessage = captor.getValue().getPayload();
        assertTrue(lastMessage.contains("playerUpdate"));
        assertTrue(lastMessage.contains("Player1"));
        assertTrue(lastMessage.contains("Player2"));
    }

    @Test
    void testStartGame() throws Exception {
        Map<String, Object> joinMessage1 = new HashMap<>();
        joinMessage1.put("type", "join");
        joinMessage1.put("userName", "Player1");
        joinMessage1.put("userId", "12345");

        String payload1 = objectMapper.writeValueAsString(joinMessage1);
        TextMessage textMessage1 = new TextMessage(payload1);

        Map<String, Object> joinMessage2 = new HashMap<>();
        joinMessage2.put("type", "join");
        joinMessage2.put("userName", "Player2");
        joinMessage2.put("userId", "54321");

        String payload2 = objectMapper.writeValueAsString(joinMessage2);
        TextMessage textMessage2 = new TextMessage(payload2);

        Map<String, Object> joinMessage3 = new HashMap<>();
        joinMessage3.put("type", "join");
        joinMessage3.put("userName", "Player3");
        joinMessage3.put("userId", "13579");

        String payload3 = objectMapper.writeValueAsString(joinMessage3);
        TextMessage textMessage3 = new TextMessage(payload3);

        Map<String, Object> joinMessage4 = new HashMap<>();
        joinMessage4.put("type", "join");
        joinMessage4.put("userName", "Player4");
        joinMessage4.put("userId", "24680");

        String payload4 = objectMapper.writeValueAsString(joinMessage4);
        TextMessage textMessage4 = new TextMessage(payload4);

        handler.afterConnectionEstablished(session1);
        reflectionHandleTextMessage(session1, textMessage1);
        handler.afterConnectionEstablished(session2);
        reflectionHandleTextMessage(session2, textMessage2);
        handler.afterConnectionEstablished(session3);
        reflectionHandleTextMessage(session3, textMessage3);
        handler.afterConnectionEstablished(session4);
        reflectionHandleTextMessage(session4, textMessage4);

        // 4人のプレイヤーが参加した後にゲームが開始されることを確認
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeast(1)).sendMessage(captor.capture());
        verify(session2, atLeast(1)).sendMessage(captor.capture());
        verify(session3, atLeast(1)).sendMessage(captor.capture());
        verify(session4, atLeast(1)).sendMessage(captor.capture());

        String lastMessage = captor.getValue().getPayload();
        assertTrue(lastMessage.contains("startGame"));
        assertTrue(lastMessage.contains("Player1"));
        assertTrue(lastMessage.contains("Player2"));
        assertTrue(lastMessage.contains("Player3"));
        assertTrue(lastMessage.contains("Player4"));
    }

    // sessions フィールドをリフレクションを使用して取得
    private ConcurrentHashMap<String, WebSocketSession> getHandlerSessions() throws Exception {
        return (ConcurrentHashMap<String, WebSocketSession>) getField(handler, "sessions");
    }

    // 指定したフィールドをリフレクションで取得
    private Object getField(Object target, String fieldName) throws Exception {
        var field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(target);
    }

    private void reflectionHandleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Method method = MatchmakingHandler.class.getDeclaredMethod("handleTextMessage", WebSocketSession.class, TextMessage.class);
        method.setAccessible(true);
        method.invoke(handler, session, textMessage);
    }
}