package com.devbox.mavenapp.service;

import org.springframework.stereotype.Service;

import model.Client;
import model.GameMatch;

import java.util.LinkedList;
import java.util.Queue;

public class MatchmakingService {
    private final Queue<Client> waitingQueue = new LinkedList<>();
    private final int MATCH_SIZE = 4;

    public synchronized void addClient(Client client) {
        waitingQueue.add(client);
        System.out.println("クライアントがキューに追加されました: " + client.getSession().getId());

        if (waitingQueue.size() >= MATCH_SIZE) {
            createMatch();
        }
    }

    private void createMatch() {
        System.out.println("4人のクライアントが揃いました。マッチを開始します。");
        GameMatch match = new GameMatch();

        for (int i = 0; i < MATCH_SIZE; i++) {
            match.addPlayer(waitingQueue.poll());
        }

        ApplicationServerService.sendMatchToApplicationServer(match);
    }
}
