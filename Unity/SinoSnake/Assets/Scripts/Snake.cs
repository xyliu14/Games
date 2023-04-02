using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class Snake : MonoBehaviour
{
    private Vector2 direction;
    public List<Transform> segments = new List<Transform>();
    public GameObject segmentPrefab;
    public Food myFood;
    public LogicManager logic;
    
    public int segmentCount = 0;
    public bool snakeAlive = true;

    // Start is called before the first frame update
    void Start()
    {
        ResetState();
    }

    // Update is called once per frame
    void Update()
    {
        if (snakeAlive){
            if (Input.GetKeyDown(KeyCode.W) && this.direction != Vector2.down){
                // if (this.direction == Vector2.left){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,-90.0f));
                // } else if (this.direction == Vector2.right){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,90.0f));
                // } 
                direction = Vector2.up;
            } else if (Input.GetKeyDown(KeyCode.S) && this.direction != Vector2.up){
                // if (this.direction == Vector2.left){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,90.0f));
                // } else if (this.direction == Vector2.right){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,-90.0f));
                // } 
                direction = Vector2.down;
            } else if (Input.GetKeyDown(KeyCode.A) && this.direction != Vector2.right){
                // if (this.direction == Vector2.up){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,90.0f));
                // } else if (this.direction == Vector2.down){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,-90.0f));
                // }
                direction = Vector2.left;
            } else if (Input.GetKeyDown(KeyCode.D) && this.direction != Vector2.left){
                // if (this.direction == Vector2.up){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,-90.0f));
                // } else if (this.direction == Vector2.down){
                //     this.transform.Rotate(new Vector3(0.0f,0.0f,90.0f));
                // }
                direction = Vector2.right;
            }
        }
    }

    private void FixedUpdate() 
    {
        for (int i = segments.Count - 1; i > 0; i--){
            segments[i].position = segments[i - 1].position;
        }

        this.transform.position = new Vector3(
            Mathf.Round(this.transform.position.x) + direction.x,
            Mathf.Round(this.transform.position.y) + direction.y,
            0.0f );
    }

    private void Grow()
    {
        GameObject segment = Instantiate(segmentPrefab);
        var segmentColor = segment.GetComponent<SpriteRenderer>();

        Color newColor = new Color(segmentColor.color.r/(float)Math.Pow(1.03,segmentCount), segmentColor.color.g/(float)Math.Pow(1.03,segmentCount), 
                                segmentColor.color.b/(float)Math.Pow(1.03,segmentCount), segmentColor.color.a);
        // print(newColor.r + " " + newColor.g + " " + newColor.b + " "+ newColor.a);
        // 这样越来越深 会分不清头和尾

        segmentColor.material.SetColor("_Color", newColor);
        segment.transform.position = segments[segments.Count - 1].position;
        segments.Add(segment.transform);

    }

    private void ResetState()
    {

        transform.position = Vector3.zero;
        direction = Vector2.zero;
        ResetSnake();
        myFood.ResetFood();
        segmentCount = 0;

    }

    public void ResetSnake(){
        for (int i = 1; i < segments.Count; i++){
            Destroy(segments[i].gameObject);
        }

        segments.Clear();
        segments.Add(this.transform);
    }

    private void OnTriggerEnter2D(Collider2D other) {
        if (other.gameObject.CompareTag("Food")) {
            segmentCount++;
            Grow();
            for (int i = 0; i < myFood.foods.Count; i++){
                if (myFood.foods[i].transform.position == this.transform.position){
                    myFood.WriteEaten(myFood.foods[i].name);
                }
            }

            myFood.RandomizePosition();

        } else if (other.gameObject.CompareTag("Obstacle")) {
            ResetState();
            snakeAlive = false;
            logic.gameOver();
        }
    }
}
