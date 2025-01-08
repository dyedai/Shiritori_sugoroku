package com.devbox.mavenapp.handler;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.devbox.mavenapp.model.Example;
import com.fasterxml.jackson.databind.ObjectMapper;

import model.Client;
import service.MatchmakingService;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/matchmaking")
public class MatchmakingWebSocketHandler {

    private static final MatchmakingService matchmakingService = new MatchmakingService();

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("新しいクライアントが接続しました: " + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        if ("join".equals(message)) {
            System.out.println("クライアント " + session.getId() + " がゲームに参加を希望しました。");
            matchmakingService.addClient(new Client(session));
        }
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("クライアントが切断されました: " + session.getId());
    }
}
