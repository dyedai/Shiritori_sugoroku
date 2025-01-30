package com.devbox.mavenapp.unit.service;  // unit が入っている

import com.devbox.mavenapp.model.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.devbox.mavenapp.service.GameService;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class GameServiceTest {

    private GameService gameService;

    @BeforeEach
    void setUp() {
        gameService = new GameService();
    }

    @Test
    void validateWord_shouldReturnFalse_whenWordEndsWithN() {
        List<String> wordHistory = new ArrayList<>();
        String word = "りんごん";

        boolean result = gameService.validateWord(word, wordHistory);

        assertFalse(result, "Words ending with 'ん' should be invalid");
    }

    @Test
    void validateWord_shouldReturnFalse_whenWordAlreadyExistsInHistory() {
        List<String> wordHistory = new ArrayList<>();
        wordHistory.add("りんご");
        String word = "りんご";

        boolean result = gameService.validateWord(word, wordHistory);

        assertFalse(result, "Words already in the history should be invalid");
    }

    @Test
    void validateWord_shouldReturnFalse_whenWordLengthIsOne() {
        List<String> wordHistory = new ArrayList<>();
        String word = "あ";

        boolean result = gameService.validateWord(word, wordHistory);

        assertFalse(result, "Words with length of 1 should be invalid");
    }

    @Test
    void validateWord_shouldReturnTrue_whenWordIsValid() {
        List<String> wordHistory = new ArrayList<>();
        String word = "りんご";

        boolean result = gameService.validateWord(word, wordHistory);

        assertTrue(result, "Valid words should pass validation");
    }

    @Test
    void updatePlayerPosition_shouldUpdatePlayerPositionCorrectly() {
        Player player = new Player(1, 1, "session1");
        int steps = 5;

        gameService.updatePlayerPosition(player, steps);

        assertEquals(5, player.getPosition(), "Player position should be updated correctly");
    }

    @Test
    void updatePlayerPosition_shouldHandleNegativeSteps() {
        Player player = new Player(1, 1, "session1");
        player.setPosition(10);
        int steps = -3;

        gameService.updatePlayerPosition(player, steps);

        assertEquals(7, player.getPosition(), "Player position should be correctly updated with negative steps");
    }
}
