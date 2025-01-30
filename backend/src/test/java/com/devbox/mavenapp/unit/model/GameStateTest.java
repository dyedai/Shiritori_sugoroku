package com.devbox.mavenapp.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.List;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import com.devbox.mavenapp.model.GameState;
import com.devbox.mavenapp.model.Player;

public class GameStateTest {
    @Test
public void testGameStateConstructorAndGetters() {
    Player player1 = new Player(1, 1, "session1");
    Player player2 = new Player(2, 2, "session2");
    List<Player> players = Arrays.asList(player1, player2);
    List<String> wordHistory = Arrays.asList("hello", "world");
    
    GameState gameState = new GameState(players, 1, wordHistory);
    
    assertEquals(players, gameState.getPlayers());
    assertEquals(1, gameState.getCurrentPlayerIndex());
    assertEquals(wordHistory, gameState.getWordHistory());
}
}