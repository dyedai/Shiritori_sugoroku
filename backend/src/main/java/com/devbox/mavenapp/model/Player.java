package com.devbox.mavenapp.model;

public class Player {
    private final int id;
    private final int order;
    private final String sessionId;
    private int position;

    public Player(int id, int order, String sessionId) {
        this.id = id;
        this.position = 0;
        this.order = order;
        this.sessionId = sessionId;
    }

    public int getId() {
        return id;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public int getOrder() {
        return order;
    }

    public String getSessionId() {
        return sessionId;
    }
}
