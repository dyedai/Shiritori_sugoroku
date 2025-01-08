package com.devbox.mavenapp.service.player;

public class UserStats {
    public int totalGames;
    public int firstPrize;
    public int secondPrize;
    public int thirdPrize;
    public int forthPrize;

    // コンストラクタ
    public UserStats() {
        this.totalGames = 0;
        this.firstPrize = 0;
        this.secondPrize = 0;
        this.thirdPrize = 0;
        this.forthPrize = 0;
    }

    // ゲーム結果を元に統計を更新
    public void updateStats(String gameResult) {
        totalGames++;

        switch (gameResult) {
            case "first":
                firstPrize++;
                break;
            case "second":
                secondPrize++;
                break;
            case "third":
                thirdPrize++;
                break;
            case "forth":
                forthPrize++;
                break;
            default:
                System.out.println("Invalid game result.");
        }
    }
}
