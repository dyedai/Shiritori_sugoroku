package com.devbox.mavenapp.handler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Objects;
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
    private static final int MAX_PLAYERS = 2;
    private static final int GOAL = 100;
    

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final List<Player> players = new ArrayList<>();
    private final List<String> wordHistory = new ArrayList<>();
    private int currentPlayerIndex = 0;
    private final Random random = new Random();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("New connection established: sessionId={}", session.getId());
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("Message received: sessionId={}, payload={}", session.getId(), message.getPayload());
        try {
            GameMessage gameMessage = objectMapper.readValue(message.getPayload(), GameMessage.class);

            switch (gameMessage.getType()) {
                case "startRoulette":
                    handleStartRoulette();
                    break;
                case "join":
                    handleJoin(session, gameMessage);
                    break;
                case "checkWord":
                    logger.debug("Handling 'checkWord' message: {}", gameMessage);
                    handleCheckWord(session, gameMessage);
                    break;
                case "timeIsUp":
                    logger.debug("Handling 'timeIsUp' message: {}", gameMessage);
                    handleTimeIsUp(session, gameMessage);
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

        synchronized(sessions) {
            sessions.values().forEach(session -> {
                try {
                    session.sendMessage(new TextMessage(jsonMessage));
                } catch (IOException e) {
                    logger.error("Error sending message to sessionId={}", session.getId(), e);
                }
            });
        }
    }

    private void handleCheckWord(WebSocketSession session, GameMessage message) throws Exception {
    String word = message.getWord();
    int playerId = message.getPlayerId(); // playerId を取得
    logger.info("Player {} validating word: {}", playerId, word);

    boolean isValid = validateWordWithWeblio(word);

    GameMessage response = new GameMessage();
    response.setType("checkResult");
    response.setValid(isValid);
    response.setPlayerId(playerId); // 応答にも playerId を含める

    broadcastMessage(response);

    if (isValid) {
        Player currentPlayer = players.get(playerId); // 正しいプレイヤーを更新
        currentPlayer.setPosition(Math.min(currentPlayer.getPosition() + word.length(), GOAL));
        wordHistory.add(word);
        logger.info("Player {} position updated to {}", playerId, currentPlayer.getPosition());

        broadcastResultMessage("「%s」\n正解！".formatted(word));

        if (currentPlayer.getPosition() >= GOAL) {
            response.setGameOver(true);
            response.setWinner(playerId);
            logger.info("Game over! Winner: Player {}", playerId);
        }
    } else {
        logger.warn("Word validation failed: {}", word);
        broadcastResultMessage("「%s」\n失敗！".formatted(word));
    }

    Thread.sleep(3000);

    currentPlayerIndex = (currentPlayerIndex + 1) % players.size(); 
    broadcastState();
    Thread.sleep(1000);

    broadcastStartTurn();
    // session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    // logger.debug("Response sent to sessionId={}: {}", session.getId(), response);
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

    private void handleTimeIsUp(WebSocketSession session, GameMessage message) throws Exception {
        if (message.getOrder() == currentPlayerIndex) {
            logger.debug("Time's up");
            broadcastResultMessage("時間切れ！失敗！");

            Thread.sleep(3000);

            currentPlayerIndex = (currentPlayerIndex + 1) % players.size(); 
            broadcastState();
            Thread.sleep(1000);
        
            broadcastStartTurn();
        }
    }

    private void handleJoin(WebSocketSession session, GameMessage message) throws Exception {
        int playerId = players.size();
        synchronized(players) {
            players.add(new Player(playerId, message.getOrder(), session.getId()));
            logger.info("Player {} added. Total players: {}", playerId, players.size());

            broadcastState();

            if (players.size() == MAX_PLAYERS) {
                broadcastStartTurn();
            }
        }
    }

    private void broadcastState() {
        GameState state = new GameState(players, currentPlayerIndex, wordHistory);
        Map<String, Object> message = new HashMap<>();
        message.put("type", "updateGameState");
        message.put("players", state.getPlayers());
        message.put("currentPlayerIndex", state.getCurrentPlayerIndex());
        message.put("wordHistory", state.getWordHistory());
        message.put("lastCharacter", getLastCharacter(wordHistory));

        synchronized(sessions) {
            sessions.values().forEach(session -> {
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                    logger.debug("Broadcast state sent to sessionId={}", session.getId());
                } catch (Exception e) {
                    logger.error("Error broadcasting state to sessionId={}", session.getId(), e);
                }
            });
        }
    }

    private void broadcastResultMessage(String body) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "resultMessage");
        message.put("body", body);

        synchronized(sessions) {
            sessions.values().forEach(session -> {
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                    logger.debug("Broadcast result message sent to sessionId={}", session.getId());
                } catch (Exception e) {
                    logger.error("Error broadcasting result message to sessionId={}", session.getId(), e);
                }
            });
        }
    }

    private void broadcastStartTurn() {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "startTurn");

        synchronized(sessions) {
            for (WebSocketSession session : sessions.values()) {
                try {
                    message.put("isCurrentUserTurn", players.stream()
                        .filter(player -> player.getOrder() == currentPlayerIndex)
                        .findFirst()
                        .get()
                        .getSessionId() == session.getId());
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                    logger.debug("Broadcast start turn sent to sessionId={}", session.getId());
                } catch (Exception e) {
                    logger.error("Error broadcasting result message to sessionId={}", session.getId(), e);
                }
            }
        }
    }

    public char getLastCharacter(List<String> wordHistory) {
        if (wordHistory.isEmpty()) {
            return 'り';
        } else {
            var lastWord = wordHistory.get(wordHistory.size() - 1);
            return getNormalHiragana(lastWord.charAt(lastWord.length() - 1));
        }
    }

    private char getNormalHiragana(char c) {
        switch (c) {
            case 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ':
                return (char)((int)c + 1);
            default:
                return c;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("Connection closed: sessionId={}, status={}", session.getId(), status);
        sessions.remove(session.getId());
    }
}
