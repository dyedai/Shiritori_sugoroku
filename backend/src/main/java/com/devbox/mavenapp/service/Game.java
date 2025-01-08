package com.devbox.mavenapp.service;

public class Game {

    private char gameID;
    private Player currentTurn;
    private Map map;

    public Game(char gameID, Player startingPlayer, Map map){
        this.gameID=gameID;
        this.currentTurn = startingPlayer;
        this.map=map;
    }

    public void startGame(){
        //マップ読み込み
        map.readMap(map.getMapID());

        //プレイヤーの初期設定
        currentTurn.setPosition(0); //スタート位置
        currentTurn.setScore(0); //スコアリセット

        // メインループ (簡易的な例) chat参照
        
    while (!isGameOver()) {
        int moveSpaces = receiveRouletteOutcome(); // ルーレットの出目を受け取る
        requestMove(moveSpaces);     // プレイヤーを移動
        sendTurnEndNotification(); //ターン終了通知
        updateTurn();                // 次のプレイヤーに交代
    }

        endGame();
    }

    public void endGame(){
        //ここに処理
    }

    private boolean isGameOver(){
        //マップが最後のマスに到達しているかの確認
        return currentTurn.getPosition() >= map.getSpaceList().size();
    }

    private int receiveRouletteOutcome() {
        // サーバから出目を受信
        // ここではランダム値で模擬
        return (int) (Math.random() * 6) + 2; // 2～8のランダム値
    }

    //Playerクラスに移動要求
    public void requestMove(int spaces){
        currentTurn.move(spaces);
    }

    private void sendTurnEndNotification() {
        // サーバにターン終了を通知する処理
    }

    private void updateTurn(){
        //次のプレイヤーに切り替える処理
    }




    public char gatGameID(){
        return gameID;
    }

    public Player getCurrentTurn(){
        return currentTurn;
    }

    public void setCurrentTurn(Player currentTurn){
        this.currentTurn=currentTurn;

        /* 
        public Map getMap(){
            return map;
        }
        
        public void setMap(Map map){
            this.map=map;
        }
            */
    }
}
