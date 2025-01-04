package com.devbox.mavenapp.service.player;

public class UserStats {
    int totalGames;
    int firstPrize;
    int secondPrize;
    int thridPrize;
    int forthPrize;

    public UserStats(int totalGames,
                     int firstPrize,
                     int secondPrize,
                     int thridPrize,
                     int forthPrize){
        this.totalGames=totalGames;
        this.firstPrize=firstPrize;
        this.secondPrize=secondPrize;
        this.thridPrize=thridPrize;
        this.forthPrize=forthPrize;
    }
    public void updateStatus(int gameResult){
        totalGames++;
        
    }
}
