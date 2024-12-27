package com.devbox.mavenapp.model;

public class Example {
      private String message;
      private String sender;
      private String timestamp;

      public Example() {
      }

      public Example(String message, String sender, String timestamp) {
            this.message = message;
            this.sender = sender;
            this.timestamp = timestamp;
      }

      public String getMessage() {
            return message;
      }

      public void setMessage(String message) {
            this.message = message;
      }

      public String getSender() {
            return sender;
      }

      public void setSender(String sender) {
            this.sender = sender;
      }

      public String getTimestamp() {
            return timestamp;
      }

      public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
      }

      @Override
      public String toString() {
            return "Example{" +
                        "message='" + message + '\'' +
                        ", sender='" + sender + '\'' +
                        ", timestamp='" + timestamp + '\'' +
                        '}';
      }
}