package com.devbox.mavenapp.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MatchmakingHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(MatchmakingHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToUserName = new ConcurrentHashMap<>(); // セッションID -> ユーザー名
    private static final int MAX_PLAYERS = 4;
    private final List<String> playerNames = Collections.synchronizedList(new ArrayList<>());

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("New player connected: sessionId={}", session.getId());
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("Message received: sessionId={}, payload={}", session.getId(), message.getPayload());

        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);

            if ("join".equals(payload.get("type"))) {
                String userName = (String) payload.get("userName");

                // セッションが既に名前に関連付けられている場合は無視
                if (sessionToUserName.containsKey(session.getId())) {
                    logger.warn("Session {} already has a username associated.", session.getId());
                    return;
                }

                // 重複ユーザー名の確認
                if (!playerNames.contains(userName)) {
                    playerNames.add(userName);
                    sessionToUserName.put(session.getId(), userName); // セッションに名前を紐付け
                    logger.info("Player joined: {}", userName);

                    broadcastPlayerCount();

                    // プレイヤーが最大数に達した場合、ゲームを開始
                    if (playerNames.size() == MAX_PLAYERS) {
                        startGame();
                    }
                } else {
                    logger.warn("Duplicate player name attempt: {}", userName);
                    session.sendMessage(new TextMessage(
                            objectMapper.writeValueAsString(Collections.singletonMap("error", "Username already taken."))));
                }
            }
        } catch (Exception e) {
            logger.error("Error handling message: {}", message.getPayload(), e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        logger.info("Player disconnected: sessionId={}, status={}", session.getId());
        sessions.remove(session.getId());

        // 名前を削除
        String userName = sessionToUserName.remove(session.getId());
        if (userName != null) {
            playerNames.remove(userName);
            logger.info("Removed player: {}", userName);
        }

        broadcastPlayerCount();
    }

    private void broadcastPlayerCount() {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "playerUpdate");
        message.put("playerCount", playerNames.size());
        message.put("playerNames", playerNames);

        broadcastMessage(message);
    }

    private void startGame() {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "startGame");

        broadcastMessage(message);
    }

    private void broadcastMessage(Map<String, Object> message) {
        String jsonMessage;
        try {
            jsonMessage = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            logger.error("Error serializing message: {}", message, e);
            return;
        }

        sessions.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage(jsonMessage));
                logger.info("Message sent to sessionId={}: {}", session.getId(), jsonMessage);
            } catch (Exception e) {
                logger.error("Error sending message to sessionId={}", session.getId(), e);
            }
        });
    }
}
