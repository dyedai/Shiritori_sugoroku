package com.devbox.mavenapp.handler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

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

            synchronized (players) {
                switch (gameMessage.getType()) {
                    case "startRoulette":
                        handleStartRoulette();
                        break;
                    case "join":
                        handleJoin(session, gameMessage);
                        break;
                    case "checkWord":
                        handleCheckWord(session, gameMessage);
                        break;
                    case "timeIsUp":
                        handleTimeIsUp(session, gameMessage);
                        break;
                    case "inputWord":
                        handleInputWord(session, gameMessage);
                        break;
                    default:
                        logger.warn("Unknown message type received: {}", gameMessage.getType());
                }
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

    private void handleJoin(WebSocketSession session, GameMessage message) {
        synchronized (players) {
            // 既存のプレイヤーが同じセッションIDまたは同じ順序番号の場合は追加しない
            boolean alreadyExists = players.stream()
                .anyMatch(player -> player.getSessionId().equals(session.getId()));

            if (alreadyExists) {
                logger.warn("Player already joined: sessionId={}", session.getId());
                return;
            }

            int playerId = players.size();
            players.add(new Player(playerId, message.getOrder(), session.getId()));
            logger.info("Player {} added. Total players: {}", playerId, players.size());

            broadcastState();

            if (players.size() == MAX_PLAYERS) {
                broadcastStartTurn();
            }
        }
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

        broadcastMessage(response);

        if (isValid) {
            Player currentPlayer = players.get(playerId);
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
    }

    private void handleTimeIsUp(WebSocketSession session, GameMessage message) {
        if (message.getOrder() == currentPlayerIndex) {
            logger.debug("Time's up for player {}", currentPlayerIndex);
            broadcastResultMessage("時間切れ！失敗！");

            currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
            broadcastState();
            broadcastStartTurn();
        }
    }

    private void handleInputWord(WebSocketSession session, GameMessage message) throws Exception {
        synchronized(sessions) {
            GameMessage gm = new GameMessage();
            gm.setType("overwriteWord");
            gm.setWord(message.getWord());

            sessions.values().forEach(s -> {
                if (s.getId() != session.getId()) {
                    try {
                        s.sendMessage(new TextMessage(objectMapper.writeValueAsString(gm)));
                    } catch (IOException e) {
                        logger.error("Error sending message to sessionId={}", session.getId(), e);
                    }   
                }
            });
        }
    }

    private boolean validateWordWithWeblio(String word) {
        try {
            String url = "https://www.weblio.jp/content/" + word;
            String html = Jsoup.connect(url).get().html();
            return !html.contains("該当する単語が見つかりません");
        } catch (IOException e) {
            logger.error("Error connecting to Weblio for word '{}'", word, e);
            return false;
        }
    }

    private void broadcastMessage(GameMessage message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            sessions.values().forEach(session -> {
                try {
                    session.sendMessage(new TextMessage(jsonMessage));
                } catch (IOException e) {
                    logger.error("Error sending message to sessionId={}", session.getId(), e);
                }
            });
        } catch (IOException e) {
            logger.error("Error serializing message for broadcast", e);
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

        broadcastToAll(message);
    }

    private void broadcastResultMessage(String body) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "resultMessage");
        message.put("body", body);

        broadcastToAll(message);
    }

    private void broadcastStartTurn() {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "startTurn");

        sessions.values().forEach(session -> {
            try {
                boolean isCurrentTurn = players.stream()
                    .anyMatch(player -> player.getOrder() == currentPlayerIndex
                            && player.getSessionId().equals(session.getId()));
                message.put("isCurrentUserTurn", isCurrentTurn);
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            } catch (Exception e) {
                logger.error("Error broadcasting start turn to sessionId={}", session.getId(), e);
            }
        });
    }

    private void broadcastToAll(Map<String, Object> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            sessions.values().forEach(session -> {
                try {
                    session.sendMessage(new TextMessage(jsonMessage));
                } catch (IOException e) {
                    logger.error("Error sending message to sessionId={}", session.getId(), e);
                }
            });
        } catch (IOException e) {
            logger.error("Error serializing message for broadcast", e);
        }
    }

    private char getLastCharacter(List<String> wordHistory) {
        if (wordHistory.isEmpty()) {
            return 'り';
        } else {
            String lastWord = wordHistory.get(wordHistory.size() - 1);
            return getNormalHiragana(lastWord.charAt(lastWord.length() - 1));
        }
    }

    private char getNormalHiragana(char c) {
        switch (c) {
            case 'ぁ': case 'ぃ': case 'ぅ': case 'ぇ': case 'ぉ':
            case 'っ': case 'ゃ': case 'ゅ': case 'ょ':
                return (char) (c + 1);
            default:
                return c;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("Connection closed: sessionId={}, status={}", session.getId());
        sessions.remove(session.getId());
        synchronized (players) {
            players.removeIf(player -> player.getSessionId().equals(session.getId()));
        }
        broadcastState();
    }
}
