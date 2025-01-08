package com.devbox.mavenapp.service;

import org.springframework.stereotype.Service;

import model.Client;
import model.GameMatch;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static config.MatchmakingConfig.APPLICATION_SERVER_URL;

public class ApplicationServerService {

    public static void sendMatchToApplicationServer(GameMatch match) {
        StringBuilder json = new StringBuilder("{\"players\":[");
        for (Client player : match.getPlayers()) {
            json.append("\"").append(player.getSession().getId()).append("\",");
        }
        json.setLength(json.length() - 1); // 最後のカンマを削除
        json.append("]}");

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(APPLICATION_SERVER_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("アプリケーションサーバへのレスポンス: " + response.body());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("アプリケーションサーバとの通信に失敗しました。");
        }
    }
}
