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
    private final Map<String, Map<String, String>> sessionToPlayer = new ConcurrentHashMap<>(); // sessionId -> {username, userid}
    private static final int MAX_PLAYERS = 2;
    private final List<Map<String, String>> players = Collections.synchronizedList(new ArrayList<>());
    private String roomId = UUID.randomUUID().toString(); // 固定のRoom IDを生成

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
                String userId = String.valueOf(payload.get("userId")); // userIdを文字列に変換

                if (sessionToPlayer.containsKey(session.getId())) {
                    logger.warn("Session {} already has a player associated.", session.getId());
                    return;
                }

                // 重複チェック
                boolean isDuplicate = players.stream()
                        .anyMatch(player -> player.get("userid").equals(userId) || player.get("username").equals(userName));
                if (!isDuplicate) {
                    Map<String, String> player = new HashMap<>();
                    player.put("username", userName);
                    player.put("userid", userId);

                    players.add(player);
                    sessionToPlayer.put(session.getId(), player);

                    logger.info("Player joined: {} ({}) in room {}", userName, userId, roomId);

                    broadcastPlayerUpdate();

                    if (players.size() == MAX_PLAYERS) {
                        startGame();
                    }
                } else {
                    logger.warn("Duplicate player attempt: {} ({})", userName, userId);
                    session.sendMessage(new TextMessage(
                            objectMapper.writeValueAsString(Collections.singletonMap("error", "Username or ID already taken."))));
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

        Map<String, String> player = sessionToPlayer.remove(session.getId());
        if (player != null) {
            players.remove(player);
            logger.info("Removed player: {} ({})", player.get("username"), player.get("userid"));
        }

        broadcastPlayerUpdate();
    }

    private void broadcastPlayerUpdate() {
        logger.info("Broadcasting player update. Current players: {}", players);

        Map<String, Object> message = new HashMap<>();
        message.put("type", "playerUpdate");
        message.put("roomId", roomId);
        message.put("playerCount", players.size());
        message.put("players", players);

        broadcastMessage(message);
    }

    private void startGame() {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "startGame");
        message.put("roomId", roomId);
        message.put("players", players); // ゲーム開始時にプレイヤーリストを送信

        logger.info("Starting game with players: {}", players);
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
