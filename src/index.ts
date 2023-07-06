import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { countryCrossword, topicList, beachCrossword } from './crosswordData';
import { generateCrossword } from './CrosswordAlgo2';
import { randomLimited, englishAlphabets, spanishAlphabets } from './helper';
import _, { map } from 'underscore';
import { getUserName, setUserName } from './database';
import { generateAccessToken, generateUserName } from "./helper";
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'Bhaskar',
  host: 'localhost',
  database: 'crossword',
  password: 'bhanu=vasu1234',
  port: 10001,
})
const jcc = require('json-case-convertor');
const PORT = 10000;
const app= express();

 

app.use(cors({
    credentials:true,
}));

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

const server= http.createServer(app);


server.listen(PORT, () => {
    console.log("Server listening on port: "+PORT);
});



app.get('/english_alphabets', (req, res) => {
    res.send(englishAlphabets);
  });


app.get('/spanish_alphabets', (req, res) => {
    res.send(spanishAlphabets);
  });

app.post('/systemgenerated_crossword', async (req, res) => {

    var topic = req.body.topic;
    let string: any;
    let json: any;
    if(req.body.language === 'en') {

        // filtering topics for words to be done here
        if(topic === "beach") {
            string = JSON.stringify(beachCrossword.crossWordEnglish);
            json = JSON.parse(string);
            }
            else if(topic === "country") {
                string = JSON.stringify(countryCrossword.crossWordEnglish);
                json = JSON.parse(string);
            }
            else {
                res.send({"message": "Invalid topic, check if topic is lowercase"})
            }
        var limited_List = [];
        
        for(let i = 0; i < req.body.words_limit; i++) {
            limited_List.push(randomLimited(limited_List, json[0].allWords));
         }
       
        const words = jcc.upperCaseAll(limited_List);
    const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    json[0].limited_words =jcc.upperCaseAll(limited_List);
    json[0].words_grid= crosswordGrid;
   res.send(json[0]);

}
else if(req.body.language === 'es') {
    
      // filtering topics for words to be done here
      if(topic === "beach") {
        string = JSON.stringify(beachCrossword.crossWordSpanish);
        json = JSON.parse(string);
        }
        else if(topic === "country") {
            string = JSON.stringify(countryCrossword.crossWordSpanish);
            json = JSON.parse(string);
        }
        else {
            res.send({"message": "Invalid topic, check if topic is lowercase"})
        }

    var limited_List = [];


    for(let i = 0; i < req.body.words_limit; i++) {
        limited_List.push(randomLimited(limited_List, json[0].allWords));
     }
   
    const words = jcc.upperCaseAll(limited_List);
    const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ');
    json[0].limited_words = jcc.upperCaseAll(limited_List);
    json[0].words_grid= crosswordGrid;
    res.send(json[0]);


}
else {
    res.send({ message:"Incorrect Language!"});
}
  });

  app.post('/usergenerated_crossword',async (req, res) => {

    const words = jcc.upperCaseAll(JSON.parse(req.body.all_words));
    if(req.body.words_limit> words.length) {
        res.send({"message":"Words limit should be less than number of words available in List"});
        return;
    }
    if(req.body.language === 'en') {
        const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

        const data = JSON.stringify({"allWords": words});
        var _data = JSON.parse(data);
        var limited_List = [];
    
        for(let i = 0; i < req.body.words_limit; i++) {
            limited_List.push(randomLimited(limited_List, words));
         }

         _data.language = "English, en"
         _data.limited_words= jcc.upperCaseAll(limited_List);
         _data.words_grid= crosswordGrid;
         _data.words_limit= req.body.words_limit;
        
        res.send(_data);
    }
   else if(req.body.language === 'es') {
    const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ');

    const data = JSON.stringify({"allWords": words});
    var _data = JSON.parse(data);
    var limited_List = [];

   for(let i = 0; i < req.body.words_limit; i++) {
            limited_List.push(randomLimited(limited_List, words));
         }
     _data.language = "Spanish, es"
     _data.limited_words= jcc.upperCaseAll(limited_List);
     _data.words_grid= crosswordGrid;
     _data.words_limit= req.body.words_limit;
    
    res.send(_data);
   }
  });


  app.post('/randomgenerated_crossword', async (req, res) => {

    var topic = topicList[(Math.floor(Math.random() * topicList.length))];
    console.log(topic);
    let string : any;
    let json:any;
    if(req.body.language === 'en') {

        // filtering topics for words to be done here

        if(topic === "beach") {
        string = JSON.stringify(beachCrossword.crossWordEnglish);
        json = JSON.parse(string);
        }
        else if(topic === "country") {
            string = JSON.stringify(countryCrossword.crossWordEnglish);
            json = JSON.parse(string);
        }
        var limited_List = [];
        
        for(let i = 0; i < req.body.words_limit; i++) {
            limited_List.push(randomLimited(limited_List, json[0].allWords));
         }
       
        const words = jcc.upperCaseAll(limited_List);
    const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    json[0].limited_words = jcc.upperCaseAll(limited_List);
    json[0].words_grid= crosswordGrid;
   res.send(json[0]);

}
else if(req.body.language === 'es') {
    
      // filtering topics for words to be done here
      if(topic === "beach") {
        string = JSON.stringify(beachCrossword.crossWordSpanish);
        json = JSON.parse(string);
        }
        else if(topic === "country") {
            string = JSON.stringify(countryCrossword.crossWordSpanish);
            json = JSON.parse(string);
        }

    var limited_List = [];


    for(let i = 0; i < req.body.words_limit; i++) {
        limited_List.push(randomLimited(limited_List, json[0].allWords));
     }


    const words = jcc.upperCaseAll(limited_List);
    const crosswordGrid = generateCrossword(words,'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ');
    json[0].limited_words = jcc.upperCaseAll(limited_List);
    json[0].words_grid= crosswordGrid;
    res.send(json[0]);


}
else {
    res.send({ message:"Incorrect Language!"});
}
  });

app.get('/getUserName', async (req, res) => {
    var userName= generateUserName("user", 6);
      var token = generateAccessToken(userName);
      const  data  =  await pool.query(`SELECT * FROM usertable WHERE username= $1;`, [userName]); //Checking if user already exists
      const  arr  =  data.rows; 
      if (arr.length  !=  0) {
          res.send({'message':'User already exists, try to call this API again'});
  
      }
      else {
          console.log("User created");
         await pool.query(`Insert into usertable values (default,$1, $2, 50, 'none')`, [userName, token],async (err) => 
         {
          if(err) {
            res.send({"message": err.message});
          }
          else {
           const id =  await pool.query(`SELECT * FROM usertable WHERE username= $1;`, [userName]);
        
            if(id.rows.length <1) {
                res.send({"message": "There was an error"});
            }
            else {
               
            res.send({'message:':'user created successfully!', "userId": id.rows[0].id,
            "userName":userName, "accessToken":token, "gamesLeft":50, 'subcriptionStatus':"none"});
           
          }

  


    }
         });
       
      
  
        
      }
    
});

app.post('/changeUserName', async (req, res) => {

    var userName= req.body.userName;
    var userId=  req.body.userId;

    const token = await pool.query('select * from usertable where id=$1', [userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {

            const nameCheck =await pool.query('select * from usertable');
            
            if(JSON.stringify(nameCheck.rows).toString().includes(userName))  
            {
                res.send({"message": "This username already exists!"});
            }
        else {
            const data= await pool.query('UPDATE usertable set username=$1 where id=$2', [userName, userId]);

            if(data.rowCount!=1) {
                res.send({"message": "There was an error, check the user id and username!"});
            }
            
            else {
               
            res.send({'message:':'userName updated successfully!', "userId": userId,
            "userName":userName});
            }
          }
        }
        else {
            res.send({"message": "Invalid accessToken"});
        }
    }
  
});
      
app.post('/getUserInfo', async (req, res) => {
    const userid=req.body.userId;

    const data= await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {
            var data_ = data.rows[0];
            data_['message'] = 'profile information';
    
            res.status(200).send(data_);
        }
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});

app.post('/addUserGameRecord', async function (req, res) {
    const userid=req.body.userId;
    const gameId=req.body.gameId;
    const timeScore = req.body.timeScore;
    const crosswordScore= req.body.crosswordScore;
    const timeScoreText=req.body.timeScoreText;

    const data= await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {
            const saveRecord = await pool.
            query("INSERT INTO gameleaderboards VALUES(default,$1, $2, $3,$4, $5 )",[gameId,
            userid,timeScore, crosswordScore, timeScoreText])

            if(saveRecord.rowCount !=1) {
                res.status(400).send({'message':'There was an error!'})
            }
            else {
                res.status(200).send({'message':'Added to records successfully'})
            }
           
        }
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
})

  
app.post('/getLeaderboards', async(req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const data_= await pool.query
            ('SELECT * FROM gameleaderboards WHERE gameid= $1 ORDER BY timescore Limit 5;', [req.body.gameId]);

            var FinalData = {'message':'leaderboards fetched successfully'};
            FinalData['leaderboards'] = data_.rows;
            res.status(200).send(FinalData);
        }
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});