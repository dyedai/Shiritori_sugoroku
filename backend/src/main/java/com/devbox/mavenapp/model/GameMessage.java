package com.devbox.mavenapp.model;

public class GameMessage {
    private String type;
    private String word;
    private boolean valid;
    private boolean gameOver;
    private int winner;
    private int playerId;
    private String userName;
    private int result; // ルーレットの結果用フィールドを追加

    // Getter と Setter
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

    public int getPlayerId() {
        return playerId;
    }

    public void setPlayerId(int playerId) {
        this.playerId = playerId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getResult() { // 新しく追加
        return result;
    }

    public void setResult(int result) { // 新しく追加
        this.result = result;
    }
}
