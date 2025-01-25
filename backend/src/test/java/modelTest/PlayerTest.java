package modelTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.devbox.mavenapp.model.Player;

public class PlayerTest {
    @Test
public void testPlayerConstructorAndGetters() {
    Player player = new Player(1, 1, "session1");
    
    assertEquals(1, player.getId());
    assertEquals(1, player.getOrder());
    assertEquals("session1", player.getSessionId());
}
@Test
public void testSetPositionAndGetPosition() {
    Player player = new Player(1, 1, "session1");
    player.setPosition(5);
    assertEquals(5, player.getPosition());
}
}
