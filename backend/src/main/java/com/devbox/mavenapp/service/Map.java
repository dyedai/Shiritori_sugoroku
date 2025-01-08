package com.devbox.mavenapp.service;
import java.util.List;

public class Map {

    private char mapID;
    private char mapName;
    //private List<Space> spaceList;

    public Map(char mapID, char mapName /*List<Space> spaceList*/) {
        this.mapID = mapID;
        this.mapName = mapName;
        //this.spaceList = spaceList;
    }

    public void readMap(char mapID){
        //ここに処理書く
    }

    public char getMapID() {
        return mapID;
    }

    public void setMapID(char mapID) {
        this.mapID = mapID;
    }

    public char getMapName() {
        return mapName;
    }

    public void setMapName(char mapName) {
        this.mapName = mapName;
    }

    /*
    public List<Space> getSpaceList() {
        return spaceList;
    }

    public void setSpaceList(List<Space> spaceList) {
        this.spaceList = spaceList;
    }
        */

}
