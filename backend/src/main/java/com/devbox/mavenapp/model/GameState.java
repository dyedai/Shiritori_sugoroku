package com.devbox.mavenapp.model;

import java.util.List;

public class GameState {
    private final List<Player> players;
    private final int currentPlayerIndex;
    private final List<String> wordHistory;

    public GameState(List<Player> players, int currentPlayerIndex, List<String> wordHistory) {
        this.players = players;
        this.currentPlayerIndex = currentPlayerIndex;
        this.wordHistory = wordHistory;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public int getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }

    public List<String> getWordHistory() {
        return wordHistory;
    }

    public char getLastCharacter() {
        if (wordHistory.isEmpty()) {
            return 'り';
        } else {
            var lastWord = wordHistory.get(wordHistory.size() - 1);
            return lastWord.charAt(lastWord.length() - 1);
        }
    }
}
