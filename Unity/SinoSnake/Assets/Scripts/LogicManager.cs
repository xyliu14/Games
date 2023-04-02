using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LogicManager : MonoBehaviour
{
    public Food FD;
    public Snake SK;
    public int hanziCount = 0;
    public GameObject gameOverScreen;
    public Text ZimuPrefab;
    public Transform Canvas;


    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        LevelUp();
    }

    public void LevelUp(){
        if(hanziCount == 3){
            FD.level++;
            FD.numZimu++;
            Text zimu = Instantiate(ZimuPrefab, Canvas);
            FD.foods.Add(zimu);
            hanziCount = 0;
            FD.UpdatePinyinText();
            SK.ResetSnake();
        }
    }

    public void RestartGame(){
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    public void gameOver()
    {
        gameOverScreen.SetActive(true);
    }

    // public void checkEaten(){
    //     foreach (string x in FD.vowels){
    //         if (x == FD.foodEaten[FD.foodEaten.Count - 1]){
    //             FD.nextZimu = "cons";
    //         } 
    //     }
        
    //     foreach (string y in FD.consonants){
    //         if (y == FD.foodEaten[FD.foodEaten.Count - 1]){
    //             FD.nextZimu = "vowel";
    //         }
    //     }
    // }

}


