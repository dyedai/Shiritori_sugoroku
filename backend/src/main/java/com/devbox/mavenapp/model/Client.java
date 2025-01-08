package com.devbox.mavenapp.model;

import javax.websocket.Session;

public class Client {
    private final Session session;

    public Client(Session session) {
        this.session = session;
    }

    public Session getSession() {
        return session;
    }
}
