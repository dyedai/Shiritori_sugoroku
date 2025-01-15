package com.devbox.mavenapp.handler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.devbox.mavenapp.model.GameMessage;
import com.devbox.mavenapp.model.GameState;
import com.devbox.mavenapp.model.Player;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GameWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(GameWebSocketHandler.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final List<Player> players = Collections.synchronizedList(new ArrayList<>());
    private final List<String> wordHistory = Collections.synchronizedList(new ArrayList<>());
    private int currentPlayerIndex = 0;
    private static final int GOAL = 100;
    private final Random random = new Random();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("New connection established: sessionId={}", session.getId());
        sessions.put(session.getId(), session);
        synchronized (players) {
            int playerId = players.size();
            players.add(new Player(playerId));
            logger.debug("Player {} added. Total players: {}", playerId, players.size());
        }
        broadcastState();
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        logger.info("Message received: sessionId={}, payload={}", session.getId(), message.getPayload());
        try {
            GameMessage gameMessage = objectMapper.readValue(message.getPayload(), GameMessage.class);

            switch (gameMessage.getType()) {
                case "startRoulette":
                    handleStartRoulette();
                    break;
                case "checkWord":
                    handleCheckWord(session, gameMessage);
                    break;
                default:
                    logger.warn("Unknown message type received: {}", gameMessage.getType());
            }
        } catch (Exception e) {
            logger.error("Error processing message: {}", message.getPayload(), e);
        }
    }

    private void handleStartRoulette() {
        int result = random.nextInt(7) + 2; // ランダムなルーレット結果を生成（2〜8）
        logger.info("Roulette started, result={}", result);

        GameMessage response = new GameMessage();
        response.setType("rouletteResult");
        response.setResult(result);

        broadcastMessage(response);
    }

    private void broadcastMessage(GameMessage message) {
        String jsonMessage;
        try {
            jsonMessage = objectMapper.writeValueAsString(message);
        } catch (IOException e) {
            logger.error("Error serializing message for broadcast", e);
            return;
        }

        sessions.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (IOException e) {
                logger.error("Error sending message to sessionId={}", session.getId(), e);
            }
        });
    }

    private void handleCheckWord(WebSocketSession session, GameMessage message) throws Exception {
        String word = message.getWord();
        int playerId = message.getPlayerId();
        logger.info("Player {} validating word: {}", playerId, word);

        boolean isValid = validateWordWithWeblio(word);

        GameMessage response = new GameMessage();
        response.setType("checkResult");
        response.setValid(isValid);
        response.setPlayerId(playerId);

        synchronized (players) {
            if (isValid) {
                Player currentPlayer = players.get(playerId);
                currentPlayer.setPosition(Math.min(currentPlayer.getPosition() + word.length(), GOAL));
                wordHistory.add(word);
                logger.info("Player {} position updated to {}", playerId, currentPlayer.getPosition());

                if (currentPlayer.getPosition() >= GOAL) {
                    response.setGameOver(true);
                    response.setWinner(playerId);
                    logger.info("Game over! Winner: Player {}", playerId);
                }
            } else {
                logger.warn("Word validation failed: {}", word);
            }
        }

        broadcastState();
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private boolean validateWordWithWeblio(String word) {
        try {
            String url = "https://www.weblio.jp/content/" + word;
            String html = Jsoup.connect(url).get().html();
            boolean isValid = !html.contains("該当する単語が見つかりません");
            logger.debug("Weblio validation result for '{}': {}", word, isValid);
            return isValid;
        } catch (IOException e) {
            logger.error("Error connecting to Weblio for word '{}'", word, e);
            return false;
        }
    }

    private void broadcastState() {
        GameState state;
        synchronized (players) {
            state = new GameState(players, currentPlayerIndex, new ArrayList<>(wordHistory));
        }

        sessions.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(state)));
                logger.debug("Broadcast state sent to sessionId={}", session.getId());
            } catch (Exception e) {
                logger.error("Error broadcasting state to sessionId={}", session.getId(), e);
            }
        });
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("Connection closed: sessionId={}, status={}", session.getId(), status);
        sessions.remove(session.getId());
    }
}
