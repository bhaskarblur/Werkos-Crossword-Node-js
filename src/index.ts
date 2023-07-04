import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { countryCrossword, topicList, beachCrossword } from './crosswordData';
import {gridToJSON, generateCrosswordGrid} from './systemCrosswordAlgo';
import { generateCrossword } from './CrosswordAlgo2';
import _, { map } from 'underscore';
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

const englishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];

const spanishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];



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
    const crosswordGrid = generateCrossword(words,englishAlphabets);
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
    const crosswordGrid = generateCrossword(words,spanishAlphabets);
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
        const crosswordGrid = generateCrossword(words,englishAlphabets);

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
    const crosswordGrid = generateCrossword(words,spanishAlphabets);

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
    const crosswordGrid = generateCrossword(words, englishAlphabets);
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
    const crosswordGrid = generateCrossword(words,spanishAlphabets);
    json[0].limited_words = jcc.upperCaseAll(limited_List);
    json[0].words_grid= crosswordGrid;
    res.send(json[0]);


}
else {
    res.send({ message:"Incorrect Language!"});
}
  });


  function randomLimited(limited_List:any[], words:any[]) {
    var wordReturn;

    wordReturn = words.splice(Math.floor(Math.random() * (words.length + 1)), 1)[0];
    if(wordReturn === undefined) {
       return wordReturn = randomLimited(limited_List, words)
    }
   // console.log(wordReturn)
  return wordReturn;
  }

  