package com.devbox.mavenapp.service.player;

public class Player {
    public char playerID;
    public int position;
    public char turnStatus; // 'A' for active, 'E' for ended
    public int score;
    public int moveSpaces;
    public UserStats userStats; // プレイヤーの統計情報

    // コンストラクタ
    public Player(char playerID, int position, char turnStatus, int score, int moveSpaces) {
        this.playerID = playerID;
        this.position = position;
        this.turnStatus = turnStatus;
        this.score = score;
        this.moveSpaces = moveSpaces;
        this.userStats = new UserStats(); // 新規インスタンスを作成
    }

    // ターン状態を設定
    public void setStates(char turnStatus) {
        this.turnStatus = turnStatus;
    }

    // プレイヤーを移動させる
    public void move(int moveSpaces) throws IllegalAccessException {
        // ターンが終了している場合
        if (turnStatus == 'E') {
            throw new IllegalAccessException("Player's turn has already ended.");
        }

        // 移動マス数が範囲外の場合
        if (moveSpaces < 0 || moveSpaces > 8) {
            throw new IllegalAccessException("Move spaces must be between 0 and 8.");
        }

        int newPosition = position + moveSpaces;

        // 最大マス数を超えた場合
        if (newPosition > 100) {
            position = 100; // 100に制限
        } else {
            position = newPosition;
        }

        System.out.println("New position: " + position);

        // ターンを終了
        turnStatus = 'E';
    }

    // ゲーム結果を更新
    public void updateGameStats(String gameResult) {
        userStats.updateStats(gameResult);
    }
}
