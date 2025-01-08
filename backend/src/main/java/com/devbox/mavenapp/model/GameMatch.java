package com.devbox.mavenapp.model;

import java.util.LinkedList;
import java.util.Queue;

public class GameMatch {
    private final Queue<Client> players = new LinkedList<>();

    public void addPlayer(Client player) {
        players.add(player);
    }

    public Queue<Client> getPlayers() {
        return players;
    }
}
