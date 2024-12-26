package com.devbox.mavenapp.service;

import com.devbox.mavenapp.model.Player;

import java.util.List;

public class GameService {
    public boolean validateWord(String word, List<String> wordHistory) {
        if (word.endsWith("ん")) return false;
        if (wordHistory.contains(word)) return false;
        return word.length() > 1;
    }

    public void updatePlayerPosition(Player player, int steps) {
        player.setPosition(player.getPosition() + steps);
    }
}
