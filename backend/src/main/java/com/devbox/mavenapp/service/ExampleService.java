package com.devbox.mavenapp.service;

import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import com.devbox.mavenapp.service.player.Player;


@Service
@Controller
public class ExampleService {
@RequestMapping("/start")
      public String getExampleMessage() throws IllegalAccessException {
            Player player=new Player('0', 98, '1', 0, 0);
            player.move(1);
            return "Hello from ExampleService!";
      }
}