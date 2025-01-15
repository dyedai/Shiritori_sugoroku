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
        // テスト用の GameWebSocketHandler インスタンスを初期化
        handler = new GameWebSocketHandler();
        objectMapper = new ObjectMapper();

        session1 = mock(WebSocketSession.class);
        session2 = mock(WebSocketSession.class);
        
        when(session1.getId()).thenReturn("session1");
        when(session2.getId()).thenReturn("session2");
    }

    @Test
    void testAfterConnectionEstablished() throws Exception {
        // 接続確立メソッドを呼び出し
        handler.afterConnectionEstablished(session1);

        // セッションが正しく追加されたことを確認
        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertTrue(sessions.containsKey("session1"));
        assertEquals(1, sessions.size());

        // プレイヤーが正しく追加されたことを確認
        List<Player> players = getHandlerPlayers();
        assertEquals(1, players.size());
        assertEquals(0, players.get(0).getId());
    }

    @Test
    void testHandleTextMessage_CheckWord_Valid() throws Exception {
        // 有効な単語でテスト
        handler.afterConnectionEstablished(session1);

        // ゲームメッセージを設定
        GameMessage gameMessage = new GameMessage();
        gameMessage.setType("checkWord");
        gameMessage.setWord("example");
        gameMessage.setPlayerId(0);

        // メッセージを送信
        String payload = objectMapper.writeValueAsString(gameMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.handleTextMessage(session1, textMessage);

        // プレイヤーの位置が更新され、単語履歴に追加されていることを確認
        List<Player> players = getHandlerPlayers();
        assertEquals("example".length(), players.get(0).getPosition());
        assertTrue(getHandlerWordHistory().contains("example"));
    }

    @Test
    void testHandleTextMessage_CheckWord_Invalid() throws Exception {
        // 無効な単語でテスト
        handler.afterConnectionEstablished(session1);

        // ゲームメッセージを設定
        GameMessage gameMessage = new GameMessage();
        gameMessage.setType("checkWord");
        gameMessage.setWord("invalidword123");
        gameMessage.setPlayerId(0);

        // メッセージを送信
        String payload = objectMapper.writeValueAsString(gameMessage);
        TextMessage textMessage = new TextMessage(payload);

        handler.handleTextMessage(session1, textMessage);

        // プレイヤーの位置が更新されておらず、単語履歴に追加されていないことを確認
        List<Player> players = getHandlerPlayers();
        assertEquals(0, players.get(0).getPosition());
        assertFalse(getHandlerWordHistory().contains("invalidword123"));
    }

    
    @Test
    void testBroadcastState() throws Exception {
        // 複数のセッションに対して状態をブロードキャストするテスト
        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        // すべてのセッションにメッセージが送信されたことを検証
        verify(session1, atLeast(1)).sendMessage(any(TextMessage.class));
        verify(session2, atLeast(1)).sendMessage(any(TextMessage.class));
    }
    

    @Test
    void testAfterConnectionClosed() throws Exception {
        // セッションが切断された場合のテスト

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionClosed(session1, null);

        // セッションが正しく削除されたことを確認
        ConcurrentHashMap<String, WebSocketSession> sessions = getHandlerSessions();
        assertFalse(sessions.containsKey("session1"));
    }

    // sessions フィールドをリフレクションを使用して取得
    private ConcurrentHashMap<String, WebSocketSession> getHandlerSessions() throws Exception {
        return (ConcurrentHashMap<String, WebSocketSession>) getField(handler, "sessions");
    }

    // players フィールドをリフレクションを使用して取得
    private List<Player> getHandlerPlayers() throws Exception {
        return (List<Player>) getField(handler, "players");
    }

    // wordHistory フィールドをリフレクションを使用して取得
    private List<String> getHandlerWordHistory() throws Exception {
        return (List<String>) getField(handler, "wordHistory");
    }

    // 指定したフィールドをリフレクションで取得
    private Object getField(Object target, String fieldName) throws Exception {
        var field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(target);
    }
}
