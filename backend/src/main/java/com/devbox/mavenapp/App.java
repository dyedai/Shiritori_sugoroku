package com.devbox.mavenapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

@RestController
@RequestMapping("/api")
class ShiritoriController {

    @GetMapping("/shiritori")
    public String startShiritori() {
        return "Shiritori game started! Let's play!";
    }

    @GetMapping("/sugoroku")
    public String startSugoroku() {
        return "Sugoroku game started! Roll the dice!";
    }
}
