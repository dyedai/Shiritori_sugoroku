package modelTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.devbox.mavenapp.model.GameMessage;

public class GameMessageTest {
    @Test
    public void testSettersAndGetters() {
        GameMessage gameMessage = new GameMessage();
        gameMessage.setType("start");
        gameMessage.setWord("hello");
        gameMessage.setValid(true);
        gameMessage.setGameOver(false);
        gameMessage.setOrder(1);
        gameMessage.setWinner(2);
        gameMessage.setPlayerId(101);
        gameMessage.setUserName("player1");
        gameMessage.setResult(5);
        
        assertEquals("start", gameMessage.getType());
        assertEquals("hello", gameMessage.getWord());
        assertTrue(gameMessage.isValid());
        assertFalse(gameMessage.isGameOver());
        assertEquals(1, gameMessage.getOrder());
        assertEquals(2, gameMessage.getWinner());
        assertEquals(101, gameMessage.getPlayerId());
        assertEquals("player1", gameMessage.getUserName());
        assertEquals(5, gameMessage.getResult());
    }
    @Test
    public void testGameOverSetterGetter() {
        GameMessage gameMessage = new GameMessage();
        gameMessage.setGameOver(true);
        assertTrue(gameMessage.isGameOver());
        
        gameMessage.setGameOver(false);
        assertFalse(gameMessage.isGameOver());
    }
}
