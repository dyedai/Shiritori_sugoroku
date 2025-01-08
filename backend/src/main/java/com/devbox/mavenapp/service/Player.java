package com.devbox.mavenapp.service;
import java.util.List;

public class Player {

    //アイテムは余力あれば
    private char playerID;
    private int position;
    private char turnStatus;
    private int score;
    //private List<Item> item;
    private int moveSpaces;

    public Player(char playerID, int position, char turnStatus, int score /*List<Item> item*/) {
        this.playerID = playerID;
        this.position = position;
        this.turnStatus = turnStatus;
        this.score = score;
        //this.item = item;
    }

    //移動マス数
    public void move(int moveSpaces) {
        this.position += moveSpaces;
    }

    public char getPlayerID() {
        return playerID;
    }

    public void setPlayerID(char playerID) {
        this.playerID = playerID;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public char getTurnStatus() {
        return turnStatus;
    }

    public void setTurnStatus(char turnStatus) {
        this.turnStatus = turnStatus;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    /* 
    public List<Item> getItem() {
        return item;
    }

    public void setItem(List<Item> item) {
        this.item = item;
    }
        */
}
