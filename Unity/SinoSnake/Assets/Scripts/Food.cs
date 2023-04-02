using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.IO;


public class Food : MonoBehaviour
{
    public BoxCollider2D gridArea;
    public List<Text> foods;
    public List<string> foodEaten;
    public Text zimuText;
    public Text hanziText;
    public Text pinyinLevel;
    public Text ZimuPrefab;
    public Transform Canvas;

    public LogicManager LM;
    public Snake SK;

    public int numZimu;
    public int level;
    private int originalZimu = 5;
    private int originalLevel = 2;

    public string[] hanziArray;
    public string[] zimuArray;
    public string[] pinyinArray;
    public string[] vowels = {"ō","e","ě","ē","í","á","ǘ","a","ǜ","ū","u","ǎ","i","ǒ","ü","ǐ","ā"};
    public string[] consonants = {"c","y","s","j","p","t","f","d","w","q","b","h","n","z","m","g","r"};
    public string nextZimu;


    // Start is called before the first frame update
    void Start()
    {
        for (int i = 0; i < numZimu; i++){
            Text zimu = Instantiate(ZimuPrefab, Canvas);
            foods.Add(zimu);
        }
        ReadFromFile();
        RandomizePosition();
        ResetFood();
    }

    // Update is called once per frame
    void Update()
    {
    }

    private void RandomizeSingleFood(Text fruit)
    {
        Bounds bounds = this.gridArea.bounds;
        float x = Random.Range(bounds.min.x, bounds.max.x);
        float y = Random.Range(bounds.min.y, bounds.max.y);
        fruit.transform.position = new Vector3(Mathf.Round(x), Mathf.Round(y), 0.0f);
    }

    public void RandomizePosition()
    {
        RandomizeZimu();

        for (int i = 0; i < foods.Count; i++){
            RandomizeSingleFood(foods[i]);
            for (int j = 0; j < i; j++){
                if (foods[i].transform.position == foods[j].transform.position){
                    RandomizeSingleFood(foods[i]);
                }
            }

            for (int k = 0; k < SK.segments.Count; k++){
                if (foods[i].transform.position == SK.segments[k].position){
                    RandomizeSingleFood(foods[i]);
                }
            }
        }
    }

    public void WriteEaten(string eaten)
    {
        foodEaten.Add(eaten);
        AddScore();
    }

    public void AddScore()
    {
        zimuText.text = zimuText.text + foodEaten[foodEaten.Count-1] + " ";

        string targetPinyin = "";
        List<string> allHanzi = new List<string>();
        if (foodEaten.Count >= level){
            for(int i = foodEaten.Count - level; i < foodEaten.Count; i++){
                targetPinyin += foodEaten[i];
            }

            for(int j = 0; j < pinyinArray.Length; j++){
                if(targetPinyin == pinyinArray[j]){
                    allHanzi.Add(hanziArray[j]);
                }
            }
            
            if (allHanzi.Count > 0){
                int index = Random.Range(0,allHanzi.Count);
                string luckyHanzi = allHanzi[index];
                zimuText.text = zimuText.text.Remove(zimuText.text.Length-2*level);
                hanziText.text = hanziText.text + luckyHanzi + " ";
                LM.hanziCount++;
            }

        }
    }

    public void RandomizeZimu()
    {
        // if (nextZimu == "vowel"){
        //     foreach (Text i in foods[:num]){
        //         int index = Random.Range(0, vowels.Length - 1);
        //         string zimuName =  vowels[index];
        //         i.name = zimuName;
        //         i.text = zimuName;
        //     }
        // } else if (nextZimu == "cons"){
        //     foreach (Text i in foods[:num]){
        //         int index = Random.Range(0, consonants.Length - 1);
        //         string zimuName =  consonants[index];
        //         i.name = zimuName;
        //         i.text = zimuName;
        //     }
        // } else {
        //     foreach (Text i in foods[:num]){
        //         int index = Random.Range(0, zimuArray.Length - 1);
        //         string zimuName =  zimuArray[index];
        //         i.name = zimuName;
        //         i.text = zimuName;
        //     }
        // }

        foreach (Text i in foods){
            int index = Random.Range(0, zimuArray.Length - 1);
            string zimuName =  zimuArray[index];
            i.name = zimuName;
            i.text = zimuName;
        }

    }

    public void ReadFromFile(){
        zimuArray = File.ReadAllLines("Assets/allpinyin.txt");
        pinyinArray = File.ReadAllLines("Assets/3500pinyin.txt");
        hanziArray = File.ReadAllLines("Assets/3500hanzi.txt");
        // System.Array.Sort(zimuArray);
    }

    public void ResetFood(){
        zimuText.text = "Zimu: ";
        hanziText.text = "Hanzi: ";
        pinyinLevel.text = "Zimu needed: " + level.ToString();

        foodEaten = new List<string>();
        numZimu = originalZimu;
        level = originalLevel;
    }

    public void UpdatePinyinText(){
        pinyinLevel.text = "Zimu needed: " + level.ToString();
    }

}


