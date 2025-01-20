package com.devbox.mavenapp.handler;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.devbox.mavenapp.model.Example;
import com.fasterxml.jackson.databind.ObjectMapper;


public class ExampleHandler extends TextWebSocketHandler {

      @Override
      protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
      try {
            String payload = message.getPayload();
            System.out.println("Received: " + payload);

            // Deserialize the payload to Example object
            ObjectMapper objectMapper = new ObjectMapper();
            Example example = objectMapper.readValue(payload, Example.class);

            // Process the Example object (for demonstration, just print it)
            System.out.println("Processed Example: " + example);

            // Echo the received message back to the client
            TextMessage response = new TextMessage("Echo: " + payload);
            session.sendMessage(response);
      } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            session.sendMessage(new TextMessage("Error processing your message."));
      }
      }
}
