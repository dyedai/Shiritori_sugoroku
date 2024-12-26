package com.devbox.mavenapp.model;

public class GameMessage {
    private String type;
    private String word;
    private boolean valid;
    private boolean gameOver;
    private int winner;
    private int playerId; // このフィールドを追加

    // Getter と Setter を追加
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setGameOver(boolean gameOver) {
        this.gameOver = gameOver;
    }

    public int getWinner() {
        return winner;
    }

    public void setWinner(int winner) {
        this.winner = winner;
    }

    public int getPlayerId() { // 追加したフィールドの Getter
        return playerId;
    }

    public void setPlayerId(int playerId) { // 追加したフィールドの Setter
        this.playerId = playerId;
    }
}
