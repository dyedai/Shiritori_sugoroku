package com.devbox.mavenapp.service.player;

public class Player {
    char playerID;
    int position;
    char turnStatus;
    int score;
    //List<item> item;
    int moveSpaces;

    public Player(char playerID,int position,char turnStatus,int score,int moveSpaces){
        this.playerID=playerID;
        this.position=position;
        this.turnStatus=turnStatus;
        this.score=score;
        this.moveSpaces=moveSpaces;
    }

    public void move(int moveSpaces)throws IllegalAccessException{
//移動マス数が－又は最大値８より大きい場合
        if(moveSpaces<0||moveSpaces>8){
            throw new IllegalAccessException("Move can't");
        }


        int newPosition=position+moveSpaces;
        //最大マス数を越した場合
        // if(newPosition>100){
        //    position=100;
        // }
        position=newPosition;
        System.out.println(position);

    }
}
