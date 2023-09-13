import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { findWordPositions } from './findWordAlgo';
import { markFixedWordsInGrid } from './fixedgamesCrosswordAlgo';
import { markFixedWordsInGrid2 } from './fixedgamesCrosswordAlgochallenge';
import { cleanWord, englishAlphabets, generateAccessToken, generateUserName, randomLimited, randomLimitedWithFilter, shuffleArray, spanishAlphabets } from './helper';
import { initializeGrid, markWordsInGrid } from './systemgamesCrosswordAlgo';
import { markWordsInGrid2 } from './systemgamesCrosswordAlgoForChallenges';
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'crossword-db1.cqh72de7kqjq.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'RWSryOPhfHmTgWHcLJcO',
  port: 5432,
});
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

app.get('/', (req, res) => {
    res.send('Crossword app for mobile. Download now.');
  });

  app.get('/hello', (req, res) => {
    res.send({"message":"Server is active!"});
  });


app.get('/english_alphabets', (req, res) => {
    res.send(englishAlphabets);
  });


app.get('/spanish_alphabets', (req, res) => {
    res.send(spanishAlphabets);
  });

  app.post('/allgames_list', async (req,res) => {
    try {
        const games = await pool.query('SELECT * from systemgames LIMIT $1;', [req.body.searchLimit]);

        res.status(200).send({'message':'All games!', 'gamesList':games.rows});
    }
    catch (err)
    {
        res.status(400).send({'message':err.message});
    }
  });


app.post('/search_crossword', async (req,res) => {
    try {
        const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);
        const limit = req.body.searchLimit;
        const keyword = req.body.keyword;
        
        if(token.rows[0].accesstoken === req.body.accessToken) {

            const findWord = await pool.query
            ("SELECT DISTINCT gameid from systemgameallwords where words LIKE '"+ keyword +"%' LIMIT $1;"
            , [limit]);

            const gamesFound =[]

            if(findWord.rows.length>0) {
                for(var i=0;i <findWord.rows.length;i++) {
                    const game = await pool.query
                    ('SELECT * from systemgames where gameid=$1 AND limitedwords >= $2 ;', [findWord.rows[i].gameid,  parseInt(req.body.words_limit) - 1] );

                    if(game.rows[0] !=null) {
                    gamesFound.push(game.rows[0]);
                    }
                   }
    

                res.status(200).send({'message':'Search results!','gamesFound': gamesFound});
            }
            else {
                res.status(404).send({'message':'No game found'});
            }

    
        }
        else {
            res.status(401).send({'message':'Invalid token!'});
        }
    }
    catch (err)
    {
        res.status(400).send({'message':err.message});
    }
})
app.post('/topicwise_crossword', async (req, res) => {
    try {
   
    const token = await pool.query('Select * from usertable where id=$1', [req.body.userId]);

    if(token.rows[0].gamesleft>0) {
    var topic = req.body.topic;
    var category = req.body.category;
    var type= req.body.type;

    var gameIsEligible : boolean  = false;

    var data:any = null;
        data = await pool.query
        ('SELECT * FROM systemgames WHERE topic=$1 AND category=$2 AND searchtype=$4 AND gamelanguage=$3;',[topic, category,
        req.body.language, type]);
  
        while(gameIsEligible === false)  {
        const row= data.rows[Math.floor(Math.random() * (data.rows.length))];
        const allwords = await pool.query
        ('SELECT * FROM systemgameallwords WHERE gameid=$1'
        ,[row.gameid]);
    
        const corrwords = await pool.query
        ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
        ,[row.gameid]);
    
        const incorrwords = await pool.query
        ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
        ,[row.gameid]);

        var allWords=[];
        var correctWords=[];
        var incorrectWords=[];

        for(let i=0; i<allwords.rows.length; i++) {
            allWords.push(allwords.rows[i].words);
        }

        for(let i=0; i<corrwords.rows.length; i++) {
            correctWords.push(cleanWord(String(corrwords.rows[i].words)));
        }
        
        for(let i=0; i<incorrwords.rows.length; i++) {
            incorrectWords.push(cleanWord(incorrwords.rows[i].words));
        }

        const response ={};
    response['gameDetails'] = row;
    response['allWords'] = allwords.rows;

    var filtered_words = []
    var limited_words =[];
    if(allWords.length > 0) {
    // for(let i=0; i<req.body.words_limit; i++) {
        // limited_words.push(randomLimited(limited_words, allWords));
    
    // }
    // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
}   

        var crossword;

        if(row?.searchtype === 'search') {
        if(row?.gamelanguage === 'es') {
            const grid_ = initializeGrid(14, 11);
            console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' , 
            req.body.words_limit);
            console.log(markedWords);
            
            for(let i=0; i<=req.body.words_limit; i++) {
                limited_words.push(randomLimited(limited_words, markedWords));
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
    
            crossword = grid
    }
    else {
        const grid_ = initializeGrid(14, 11);
        console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
        const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        , req.body.words_limit );
        console.log(markedWords);
        
        for(let i=0; i<=req.body.words_limit; i++) {
            limited_words.push(randomLimited(limited_words, markedWords));
        }
        limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
        filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        crossword = grid

    }
        }
        else {
            if(row?.gamelanguage === 'es') {
                const grid_ = initializeGrid(14, 11);
                console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' 
            , incorrectWords, req.body.words_limit);
                console.log(markedWords);
                
                for(let i=0; i<=req.body.words_limit; i++) {
                    limited_words.push(randomLimited(limited_words, markedWords));
                }
                limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        
                crossword = grid
        }
        else {
            const grid_ = initializeGrid(14, 11);
            console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            ,incorrectWords , req.body.words_limit);
            console.log(markedWords);
            
            for(let i=0; i<=req.body.words_limit; i++) {
                limited_words.push(randomLimited(limited_words, markedWords));
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
            crossword = grid
    
        }
        }
    const finalWords= jcc.upperCaseAll(crossword);

   
    response['limitedWords'] = limited_words;
    response['filteredWords'] = filtered_words;

    if(req.body.type !== null) {
    if(req.body.type === 'challenge') {
    response['correctWords'] = correctWords;
    response['incorrectWords'] = incorrectWords;
    }
    else{

    }
}

response['crossword_grid'] = finalWords;

if(limited_words.length === parseInt(req.body.words_limit)) {
    gameIsEligible = true;
}

if(gameIsEligible) {

res.status(200).send(response);

}
}
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }
   


}
catch (err)
{
    res.status(400).send({'message':err.message});
}
  });


  app.post('/randomsearch_crossword',async (req, res) => {

    
   try {

    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {
            if(token.rows[0].gamesleft > 0) {
                
                var gameIsEligible : boolean  = false;
                
                var allGames =[];
                const gamesSort1 = await pool.query
                ('select * from systemgames where searchtype=$1 AND limitedwords >= $4 AND gamelanguage=$2 AND playstatus=$3;',
                [req.body.type, req.body.language, 'unlimited',  parseInt(req.body.words_limit) - 1 ] );
               const gamesSort2 =await pool.query
               ('select * from systemgames where searchtype=$1 AND gamelanguage=$2 AND limitedwords >= $4 AND playstatus=$3 AND totalplayed < 6;',
               [req.body.type, req.body.language, 'limited',  parseInt(req.body.words_limit) - 1] );
               
                while(gameIsEligible === false ) {

               for(var i=0;i<gamesSort1.rows.length;i++) {
                allGames.push(gamesSort1.rows[i]);
               }


               for(var i=0;i<gamesSort2.rows.length;i++) {
                allGames.push(gamesSort2.rows[i]);
               }
           
            const singleGame = allGames[Math.floor(Math.random() * (allGames.length))];
            const gameId= singleGame?.gameid;
            console.log(gameId);

            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[gameId]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[gameId]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[gameId]);

            var allWords=[];
            var correctWords=[];
            var incorrectWords=[];

            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(String(allwords.rows[i].words));
            }

            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(cleanWord(String(corrwords.rows[i].words)));
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(cleanWord(String(incorrwords.rows[i].words)));
            }

            const response ={};
        response['gameDetails'] = singleGame;
        response['allWords'] = allwords.rows;
     

        var filtered_words = []
        var limited_words =[];
            var limited_words =[];
            var crossword;
            
            var markedWords_;
            
            if(singleGame?.searchtype === 'search') {
                
            if(singleGame?.gamelanguage === 'es') {
                
    
            const grid_ = initializeGrid(14, 11);
            console.log('originalArray: '+allWords);
            console.log('shuffledArray: '+shuffleArray(allWords));
            const { grid, markedWords, filteredMarkedwords } = 
            markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', req.body.words_limit );
            console.log('marked: '+markedWords);
            markedWords_ = markedWords
              
            for(let i=0; i <= req.body.words_limit; i++) {
                    // console.log(i);
                    limited_words.push(randomLimited(limited_words, markedWords));
                
         
            } 
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
            crossword = grid
        }

        else {
            const grid_ = initializeGrid(14, 11);
            console.log('originalArray: '+allWords);
            console.log('shuffledArray: '+shuffleArray(allWords));
            const { grid, markedWords, filteredMarkedwords } =
             markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , req.body.words_limit );
            console.log('marked: '+markedWords);
            markedWords_ = markedWords
              
            for(let i=0; i <= req.body.words_limit; i++) {
                    // console.log(i);
                    limited_words.push(randomLimited(limited_words, markedWords));
                
         
            } 
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
            crossword = grid
        }
        
            }

            else {
                if(singleGame?.gamelanguage === 'es') {
    
                    const grid_ = initializeGrid(14, 11);
                    console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                    const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
                    , incorrectWords , req.body.words_limit);
                   console.log('marked: '+markedWords);
                   markedWords_ =markedWords
              
            for(let i=0; i <= req.body.words_limit; i++) {
                    // console.log(i);
                    limited_words.push(randomLimited(limited_words, markedWords));
            }
         
           
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
            crossword = grid
                }
        
                else {
            
            console.log('----------------------------'); 
                    const grid_ = initializeGrid(14, 11);
                    console.log('originalArray: '+allWords);
                    console.log('----------------------------');          
                    console.log('shuffledArray: '+shuffleArray(allWords));
                    const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , incorrectWords, req.body.words_limit  );
                        console.log('marked: '+markedWords);
            
                        markedWords_ =markedWords
                        for(let i=0; i <= req.body.words_limit; i++) {
                                // console.log(i);
                                limited_words.push(randomLimited(limited_words, markedWords));
                        }
                     
                       
                        limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                        filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                        crossword = grid
                }
            }

        const finalWords= jcc.upperCaseAll(crossword);

       
        response['limitedWords'] = limited_words;
        response['filteredWords'] = filtered_words;
     
        if(req.body.type === 'challenge'){
        response['correctWords'] = correctWords;
        response['incorrectWords'] = incorrectWords;
        }
        else{

      
    }
        response['crossword_grid'] = finalWords;

        if(limited_words.length === parseInt(req.body.words_limit)) {
            gameIsEligible = true;
        }
        console.log('length: ', limited_words.length);
        console.log('markedlength: ', markedWords_.length);
        if(gameIsEligible) {
        res.status(200).send(response);
    }
    }
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }

}

}

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
  });

  app.post('/generateany_crossword', async (req, res) => {

    try {
    var allWords = jcc.upperCaseAll(req.body.all_words);
    var corrWords = jcc.upperCaseAll(req.body.correct_words);
    var incorrWords = jcc.upperCaseAll(req.body.incorrect_words);

    var listwords:any[]=[];

    for(let i=0; i<allWords.length; i++) {
        listwords.push(allWords[i]);
    }
    
    var limited_words=[];
    var crossword=[]
    if(req.body.words_limit!==null) {
        for(let i=0; i<req.body.words_limit; i++) {
            limited_words.push(randomLimited(limited_words, listwords));
        }

        if(req.body.language === 'es') {
            const grid = initializeGrid(14, 11);
            // populateGrid(grid, limited_words, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
            // crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            crossword = grid
        }
        else {
            const grid = initializeGrid(14, 11);
            // populateGrid(grid, limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            // crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            crossword = grid
        }
    }
    else {
        if(req.body.language === 'es') {

            const grid = initializeGrid(14, 11);
            // populateGrid(grid, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
            // crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            crossword = grid
        }
        else {
            const grid = initializeGrid(14, 11);
            // populateGrid(grid, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            // crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
            crossword = grid
        }
    }

    const response={};
    response['allWords'] = JSON.parse(allWords);
    response['correctWords'] = JSON.parse(corrWords);
    response['incorrectWords'] = JSON.parse(incorrWords);
    response['crossword_grid'] = crossword;

    res.status(200).send(response);
}
catch (err)
{
    res.status(400).send({'message':err.message});
}


  });

  app.post('/randomusergenerated_crossword',async (req, res) => {

    try {

    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {
            if(token.rows[0].gamesleft > 0) {
            var allGames ;
            if(req.body.type === "challenge") {
                 allGames = await pool.query
                 ('select * from systemgames where gametype=$1 AND searchtype=$2 AND gamelanguage=$3;',
                 ['public', 'challenge', req.body.language] );
            }
            else {
                 allGames = await pool.query
                 ('select * from systemgames where gametype=$1 AND searchtype=$2 AND gamelanguage=$3;',['public'
                , 'search', req.body.language] );
            }
           
            const singleGame = allGames.rows[Math.floor(Math.random() * (allGames.rows.length))];
            const gameId= singleGame?.gameid;
            console.log(gameId);

            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[gameId]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[gameId]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[gameId]);

            var allWords=[];
            var correctWords=[];
            var incorrectWords=[];

            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(String(allwords.rows[i].words));
            }

            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(cleanWord(String(corrwords.rows[i].words)));
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(cleanWord(String(incorrwords.rows[i].words)));
            }

            const response ={};
        response['gameDetails'] = singleGame;
        response['allWords'] = allwords.rows;
     

        var filtered_words = []
        var limited_words =[];
            var limited_words =[];

            // if(singleGame?.limitedwords !==null ) {
                // var num;
                // if(allWords.length< singleGame?.limitedwords) {
                    // num = allWords.length;
                // }
                // else{
                    // num =  singleGame?.limitedwords;
                // }
            // for(let i=0; i<num; i++) {
                // limited_words.push(randomLimited(limited_words, allWords));
                
            // }
            // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        // }
        // else {
            // limited_words = allWords;
            // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        // }
        
            var crossword;
            
            
            if(singleGame?.searchtype === 'search') {
                
            if(singleGame?.gamelanguage === 'es') {
    
            const grid_ = initializeGrid(14, 11);
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
            req.body.words_limit );
            console.log('marked: '+markedWords);
            
            if(singleGame?.limitedwords !==null) {
                var num;
                if(allWords.length< singleGame?.limitedwords) {
                    num = markedWords.length;
                }
                else{
                    num =  singleGame?.limitedwords;
                }
              
              
                for(let i=0; i< num; i++) {
                    // console.log(i);
                    limited_words.push(randomLimited(limited_words, markedWords));
                
                }
         
            }
            else {
                for(let i=0; i<markedWords.length; i++) {
                    console.log('that');
                    limited_words.push(randomLimited(limited_words, markedWords));
                }
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
            crossword = grid
        }

        else {
            const grid_ = initializeGrid(14, 11);
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' 
            ,req.body.words_limit);
            console.log('marked: '+markedWords);
            
            if(singleGame?.limitedwords !==null) {
                var num;
                if(allWords.length< singleGame?.limitedwords) {
                    num = markedWords.length;
                }
                else{
                    num =  singleGame?.limitedwords;
                }
                console.log('this');
              
                for(let i=0; i< num; i++) {
                    limited_words.push(randomLimited(limited_words, markedWords));
                
                }
         
            }
            else {
                for(let i=0; i<markedWords.length; i++) {
                    console.log('that');
                    limited_words.push(randomLimited(limited_words, markedWords));
                }
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
            crossword = grid
        }
            }
            else {
                if(singleGame?.gamelanguage === 'es') {
    
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
                    , incorrectWords , req.body.words_limit);
                    console.log('marked: '+markedWords);
                    
                    if(singleGame?.limitedwords !==null) {
                        var num;
                        if(allWords.length< singleGame?.limitedwords) {
                            num = markedWords.length;
                        }
                        else{
                            num =  singleGame?.limitedwords;
                        }
                      
                      
                        for(let i=0; i< num; i++) {
                            // console.log(i);
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                        }
                 
                    }
                    else {
                        for(let i=0; i<markedWords.length; i++) {
                            console.log('that');
                            limited_words.push(randomLimited(limited_words, markedWords));
                        }
                    }
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
        
                else {
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , incorrectWords , req.body.words_limit );
                    console.log('marked: '+markedWords);
                    
                    if(singleGame?.limitedwords !==null) {
                        var num;
                        if(allWords.length< singleGame?.limitedwords) {
                            num = markedWords.length;
                        }
                        else{
                            num =  singleGame?.limitedwords;
                        }
                        console.log('this');
                      
                        for(let i=0; i< num; i++) {
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                        }
                 
                    }
                    else {
                        for(let i=0; i<markedWords.length; i++) {
                            console.log('that');
                            limited_words.push(randomLimited(limited_words, markedWords));
                        }
                    }
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
            }

        const finalWords= jcc.upperCaseAll(crossword);

       
        response['limitedWords'] = limited_words;
        response['filteredWords'] = filtered_words;
     
        if(req.body.type === 'challenge'){
        response['correctWords'] = correctWords;
        response['incorrectWords'] = incorrectWords;
        }
        else{

      
    }
        response['crossword_grid'] = finalWords;

        res.status(200).send(response);
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }

}

}

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
  });


  app.post('/randomsystemgenerated_crossword', async (req, res) => {

    try{
    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {

            if(token.rows[0].gamesleft > 0) {
            const allGames = await pool.query
            ('select * from systemgames where gametype=$1 AND searchtype=$3 AND gamelanguage=$2;',['system',req.body?.language, 'search'] );
            const singleGame = allGames.rows[Math.floor(Math.random() * (allGames.rows.length))];
            const gameId= singleGame?.gameid;
        

            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[gameId]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[gameId]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[gameId]);

            const allWords=[];
            const correctWords=[];
            const incorrectWords=[];

            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(String(allwords.rows[i].words));
            }

            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(cleanWord(String(corrwords.rows[i].words)));
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(cleanWord(String(incorrwords.rows[i].words)));
            }

            console.log(allwords.rows.length);

            var limited_words =[];
            var filtered_words =[];
            if(allWords.length > 0) {
            // for(let i=0; i<req.body.words_limit; i++) {
                // limited_words.push(randomLimited(limited_words, allWords));
            // }
            // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        }            

            var crossword;

            if(singleGame?.searchtype ==='search') {
            if(singleGame?.gamelanguage === 'es') {
                const grid_ = initializeGrid(14, 11);
                const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
                , req.body.words_limit );
                console.log(markedWords);
                
                for(let i=0; i<req.body.words_limit; i++) {
                    limited_words.push(randomLimited(limited_words, markedWords));
                }
                  limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
                // console.log(filtered_words[0]);
                // populateGrid(grid, filtered_words[0], 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
                crossword = grid
        }
        else {
            const grid_ = initializeGrid(14, 11);
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            , req.body.words_limit );
            console.log(markedWords);
            
            for(let i=0; i<req.body.words_limit; i++) {
                limited_words.push(randomLimited(limited_words, markedWords));
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
            // console.log(filtered_words[0]);
            // populateGrid(grid, filtered_words[0], 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
            crossword = grid
   
        }
    }
    else {
        if(singleGame?.gamelanguage === 'es') {
            const grid_ = initializeGrid(14, 11);
            const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
            , incorrectWords , req.body.words_limit);
            console.log(markedWords);
            
            for(let i=0; i<req.body.words_limit; i++) {
                limited_words.push(randomLimited(limited_words, markedWords));
            }
            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
            filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
            // console.log(filtered_words[0]);
            // populateGrid(grid, filtered_words[0], 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
            crossword = grid
    }
    else {
        const grid_ = initializeGrid(14, 11);
        const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        , incorrectWords , req.body.words_limit);
        console.log(markedWords);
        
        for(let i=0; i<req.body.words_limit; i++) {
            limited_words.push(randomLimited(limited_words, markedWords));
        }
        limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
        filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        // console.log(filtered_words[0]);
        // populateGrid(grid, filtered_words[0], 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
        crossword = grid

    }
    }

        const finalWords= jcc.upperCaseAll(crossword);

        const response ={};
        response['gameDetails'] = singleGame;
        response['allWords'] = allwords.rows;
        response['limitedWords'] = limited_words;
        response['filteredWords'] = filtered_words;


        if(singleGame?.searchtype === 'challenge'){
        response['correctWords'] = correctWords;
        response['incorrectWords'] = incorrectWords;
        }
        else{

        }
        response['crossword_grid'] = finalWords;

        res.status(200).send(response);
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }
}


}

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
  });


  app.post('/gamewords_resultposition', async (req, res) => {

    try{
    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {
            const words:[] = JSON.parse(req.body.words);
            const grid:[] =  JSON.parse(req.body.grid);
            const correctwords =  JSON.parse(req.body.correctWords);
            var wordsFound=[];
            var correctWordsFound=[];
            var wordsNotFound=[]
            words.forEach(word=>{
                if(findWordPositions(grid, word)=== "Cannot find the word")
                {
                    wordsNotFound.push(word)
                }
                else {
                    var res = {};
                    wordsFound.push(findWordPositions(grid, word));
                }
               
            });

            correctwords.forEach(word=>{
                if(findWordPositions(grid, word)=== "Cannot find the word")
                {
                    wordsNotFound.push(word)
                }
                else {
                    var res = {};
                    correctWordsFound.push(findWordPositions(grid, word));
                }
               
            });
            res.status(200).send({"message":"Results words position!", "wordsFound":wordsFound, 
            "correctWordsFound":correctWordsFound, "wordsNotFound":wordsNotFound})

        }
        else {
            res.send({"message": "Invalid accessToken"});
        }
    }
}
        catch (err)
        {
            res.status(400).send({'message':err.message});
        }
          });

app.get('/getUserName', async (req, res) => {
    
    try{
    var userName= generateUserName("user", 6);
      var token = generateAccessToken(userName);
      const  data  =  await pool.query(`SELECT * FROM usertable WHERE username= $1;`, [userName]); //Checking if user already exists
      const  arr  =  data.rows; 
      if (arr.length  !=  0) {
          res.send({'message':'User already exists, try to call this API again'});
  
      }
      else {
          console.log("User created");
          const gamesLimit = await pool.query('SELECT * from systemsettings;');
          const limit = gamesLimit.rows[0].gameslimit;
         await pool.query(`Insert into usertable values (default,$1, $2, $3, 'none')`, [userName, token, limit],async (err) => 
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

                const subsStatus =   await pool.query('INSERT INTO subcriptionstatus VALUES(default, $1, $2, null, null);', 
                [id.rows[0].id, 'none']);
               
            res.send({'message':'user created successfully!', "id": id.rows[0].id,
            "username":userName, "accesstoken":token, "gamesleft": limit, 'subscriptionstatus':"none"});
           
          }

    }
         });
       
  
        
      }
      }
      catch (err)
      {
          res.status(400).send({'message':err.message});
      }
    
});

app.post('/changeUserName', async (req, res) => {

    try{

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
                await pool.query('UPDATE gameleaderboards set playername=$1 where userid=$2;',[userName, userId]);
            res.send({'message':'userName updated successfully!', "id": userId,
            "username":userName});
            }
          }
        }
        else {
            res.send({"message": "Invalid accessToken"});
        }
    }
  }
catch (err)
{
    res.status(400).send({'message':err.message});
}
});
      
app.post('/getUserInfo', async (req, res) => {

    try{
    const userid=req.body.userId;


    const data= await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {
    
        if(data.rows[0].accesstoken === req.body.accessToken) {

            const checksubs = await pool.query('SELECT * FROM subcriptionstatus WHERE userid=$1;', [userid]);

            if(checksubs.rows.length > 0){
                if(checksubs.rows[0].startdate !=null) {
                    const startDate = checksubs.rows[0].startdate;
                    const endDate = checksubs.rows[0].enddate;
        
        //            console.log(startDate.toDateString(), endDate.toDateString());
                    console.log(startDate, endDate);
                    if(startDate < endDate) {
                    
                        console.log('Subscription running');
                    }
                    else {
                        await pool.query('UPDATE usertable SET subscriptionstatus=$2 WHERE id=$1;'
                        ,[userid,'none']);
        
                        await pool.query
                        ('UPDATE subcriptionstatus SET subscriptiontype=$2, startdate=null, enddate=null WHERE userid=$1;',
                         [userid, 'none'])

                         await pool.query('UPDATE systemgames set playstatus=$1 where userid=$2',['limited',userid]);
                        console.log('Subscription ended');
                    }
                }

              
            }

            const gamestime = Date.parse(data.rows[0].gamesendeddatetime);
            var today = Date.now();
        

         console.log(today);
         console.log(gamestime);
                     
            if(gamestime !==null) {
         //    console.log(gamestime < today);

                if(gamestime < today) {
                    const gamesLimit = await pool.query('SELECT * from systemsettings;');
                    const limit = gamesLimit.rows[0].gameslimit;
                    //gamesLeft reset
                    await pool.query
                    ('UPDATE userTable SET gamesleft=$2 , gamesendedatetime=null WHERE id=$1', [userid, limit]);

                }
                else {}
              
            }

            const datanew = await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);
            var data_ = datanew.rows[0];

            if(data_.subscriptionStatus === '1year' || data_.subscriptionStatus === '1month') {
                
                // data_['subscriptionStatus'] = 50;
            }
            const gamesLimit = await pool.query('SELECT * from systemsettings;');
            const limit = gamesLimit.rows[0].gameslimit;
            data_['systemGameLimit'] =  limit;
            data_['message'] = 'profile information';
    
            res.status(200).send(data_);
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/systemupdateGameLimit', async function (req, res) {

    try{
        const query = await pool.query('SELECT * from systemsettings;');
        const oldlimit =  query.rows[0].gameslimit;
        await pool.query('UPDATE systemsettings set gameslimit=$1 where id=1;', [parseInt(req.body.gamesLimit)]);

        // console.log(oldlimit);
        // console.log(req.body.gamesLimit);
        await pool.query('UPDATE usertable set gamesleft=$1 where gamesleft=$2;',[parseInt(req.body.gamesLimit), oldlimit]);

        const queryUser= await pool.query('SELECT * from usertable;');
    
        for(var i=0; i<queryUser.rows.length; i++) {
           
            if(parseInt(queryUser.rows[i].gamesleft) > parseInt(req.body.gamesLimit)) {
                
                await pool.query('UPDATE usertable set gamesleft=$1 where gamesleft > $1;',[parseInt(req.body.gamesLimit)]);
            }
        }
        res.status(200).send({'message':'Games limit updated'});
    }
    catch(err)
    {

        res.status(400).send({'message':err.message});
    }
});

app.post('/')

app.post('/addUserGameRecord', async function (req, res) {

    try {
    const userid=req.body.userId;
    const gameId=req.body.gameId;
    const timeScore = req.body.timeScore;
    const crosswordScore= req.body.crosswordScore;
    const timeScoreText=req.body.timeScoreText;
    const playerName = req.body.playerName;

    const data= await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            if (data.rows[0].gamesleft > 0) {
                const data_ = data.rows[0].gamesleft-1;

                console.log(data.rows[0].subscriptionstatus);
                if(data.rows[0].subscriptionstatus === '1year' || data.rows[0].subscriptionstatus === '1month') {

                }
                else {
                    if(data_ < 1) {
                        const datenow_=new Date();
                        datenow_.setDate(datenow_.getDate() + 1)
                        const yyyy_ = datenow_.getFullYear();
                let mm_:any = datenow_.getMonth() + 1; // Months start at 0!
                let dd_:any = datenow_.getDate() ;
    
             const formattedToday = yyyy_ + '/' + mm_ + '/' + dd_;
                        await pool.query('UPDATE userTable SET gamesendedatetime = $1 where id=$2;',[datenow_, userid])
                    }
                    console.log(data_);
                    await pool.query('UPDATE userTable SET gamesleft=$1 where id=$2;',[data_, userid]);
                }
              
            }

            const game_ = await pool.query('SELECT * from systemgames where gameid=$1;', [gameId]);
            var totalPlayed = game_.rows[0].totalplayed;
            
            await pool.query('UPDATE systemgames set totalplayed=$1 where gameid=$2;', [parseInt(totalPlayed)+1, gameId])
            const saveRecord = await pool.
            query("INSERT INTO gameleaderboards VALUES(default,$1, $2, $3,$4, $5, $6 )",[gameId,
            userid,timeScore, crosswordScore, timeScoreText, playerName])

            if(saveRecord.rowCount !=1) {
                res.status(400).send({'message':'There was an error!'})
            }
            else {
                res.status(200).send({'message':'Added to records successfully'})
            }
           
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
})

  
app.post('/getLeaderboards', async(req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const data_= await pool.query
            ('SELECT * FROM gameleaderboards WHERE gameid= $1 ORDER BY crosswordscore DESC, timescore ASC Limit 10;', [req.body.gameId]);
            
          
        
            const name = await pool.query ('SELECT * FROM systemgames WHERE gameid= $1',[req.body.gameId]);
 
            var FinalData = {'message':'leaderboards fetched successfully'};
            if(name.rows[0]!=null){
            const name_ = name.rows[0].gamename;
            var totalwords=0;
            if(name.rows[0].limitedwords!=null){ 
                totalwords = name.rows[0].limitedwords;
            }
            else {
                totalwords = name.rows[0].totalwords;
            }
            FinalData['gameName']=name_;
            FinalData['totalWords']=totalwords;

        }

            FinalData['leaderboards'] = data_.rows;
            res.status(200).send(FinalData);
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});


app.post('/getcatstopics', async function (req, res) {

    try{
        console.log('All cats topics!');
    var data;
    data = await pool.query('Select * from categories where gamelanguage=$1 AND searchtype=$2;',
    [req.body.language,req.body.searchtype]);
    const rows= data.rows;
    var list=[];
    var topicsList=[];

    for(var i=0; i<rows.length;i++) {
        
        const topics =  await pool.query('SELECT * FROM topics where categoryname=$1 AND searchtype=$2;',
        [rows[i].categoryname, req.body.searchtype]);
        topics.rows.forEach(element => {
            topicsList.push(element);
        });
     
        list.push({"categoryName":rows[i].categoryname, "topicsList": topicsList});
        topicsList = [];
    }
   
    res.status(200).send({'message':'All categories & topics!', 'categoriesTopics':list});
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getallcatstopics', async function (req, res) {

    try{
        console.log('All cats topics!');
    var data;
    data = await pool.query('Select * from categories;');
    const rows= data.rows;
    var list=[];
    var topicsList=[];

    for(var i=0; i<rows.length;i++) {
        
        const topics =  await pool.query('SELECT * FROM topics where categoryname=$1;',
        [rows[i].categoryname]);
        topics.rows.forEach(element => {
            topicsList.push(element);
        });
     


        list.push({"category":rows[i], "topicsList": topicsList});
        topicsList = [];
    }
   
    res.status(200).send({'message':'All categories & topics!', 'categoriesTopics':list});
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/createCategoryTopic', async function (req, res) {
try{
    const categoryName = req.body.categoryName;
    const language = req.body.language;
    const searchType = req.body.searchType;
    const status = req.body.status;
    const topicName = req.body.topicName;

    const categorycheck = 
    await pool.query('SELECT * from categories where categoryname=$1 AND gamelanguage=$2 AND searchtype=$3;',
    [categoryName, language, searchType]);

    if(categorycheck.rows.length > 0) {
        await pool.query
        ('INSERT INTO topics(id,categoryname,topicsname,status,searchtype) VALUES(default,$1, $2, $3, $4);'
        , [categoryName, topicName, status, searchType]);

        res.status(200).send({'message':'Category & Topic created successfully!'});
    }
    else {
        const category= 
        await pool.query
        ('INSERT INTO categories(id,categoryname,gamelanguage,searchtype) VALUES(default,$1, $2, $3);',
        [categoryName, language, searchType]);
        
        await pool.query
        ('INSERT INTO topics(id,categoryname,topicsname,status,searchtype) VALUES(default,$1, $2, $3, $4);'
        , [categoryName, topicName, status, searchType]);

        res.status(200).send({'message':'Category & Topic created successfully!'});
    }
}
catch (err)
{
res.status(400).send({'message':err.message});
}
});
app.post('/editCategoryTopic', async function (req, res) {
try{
    const categoryid = req.body.categoryId;
    const topicid = req.body.topicId;
    const categoryName = req.body.categoryName;
    const language = req.body.language;
    const searchType = req.body.searchType;
    const status = req.body.status;
    const topicName = req.body.topicName;

    const categorycheck = 
    await pool.query('SELECT * from categories where id=$1;',
    [categoryid]);

    if(categorycheck.rows.length > 0) {
        const topicData = await pool.query('SELECT * from topics where id=$1', [topicid]);
        const category= await pool.query
        ('UPDATE categories set categoryname=$1 , gamelanguage=$2 , searchtype=$3 where id=$4;',
        [categoryName, language, searchType, categoryid]);

        await pool.query
        ('UPDATE topics set categoryname=$1, topicsname=$2 , searchtype=$3, status=$4 where id=$5;',
        [categoryName, topicName, searchType, status, topicid]);
     

 
        await pool.query('UPDATE systemgames set topic=$1 ,category=$2 where topic=$3 AND category=$4;',
        [topicName, categoryName, topicData.rows[0].topicsname, topicData.rows[0].categoryname])
        res.status(200).send({'message':'Category & Topic Updated successfully!'});
    }
    else {
        res.status(200).send({'message':'Category & Topic doesnt exist!'});
    }
}
    catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/createGame', async function (req, res) {

    try{
   
    var userId= req.body?.userId;
    var gameName:string= req.body?.gameName;
    var totalWords = req.body?.totalWords;
    var limitedWords = req.body?.limitedWords;
    var language = req.body?.gameLanguage;
    var gameType = req.body?.gameType;
    var gridType = req.body?.gridType;
    var searchType = req.body?.searchType;
    var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);

    var allWords:[]=    JSON.parse(req.body?.allWords);

    var correctWords:[];
    var incorrectWords:[];
    if(req.body.correctWords!==undefined) {
        correctWords = JSON.parse( req.body?.correctWords);
        incorrectWords = JSON.parse( req.body?.incorrectWords);
    }
    
  

    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body?.userId]);

  
    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {
            var playStatus;

            if(data.rows[0].subscriptionstatus === '1year' || data.rows[0].subscriptionstatus=== '1month') {
                playStatus = 'unlimited';
            }
            else {
                playStatus = 'limited';
            }
        
            const final= await pool.query(
            'INSERT INTO systemgames (userid,gamename,gametype,topic,category,searchtype,totalwords,sharecode,gamelanguage,limitedwords,avgratings,totalplayed,playstatus, gridtype) VALUES($8,$1,$2,null,null, $3, $4,$5,$7, $6, null, 0, $9, $10); '
            , [gameName,gameType,searchType, totalWords, shareCode, limitedWords, language, userId, playStatus, gridType])

         
            if(final.rowCount != 1) {
                res.status(400).send({'message':'There was an error1!'})
            }
            else {
         
                const data= await pool.query('SELECT * FROM systemgames where gamename=$1 AND totalwords= $2 AND sharecode=$3;'
                , [gameName, totalWords, shareCode]);

                for(let i=0;i<allWords.length;i++) {
                    const word= allWords[i];
                    const addWord = await pool.query('INSERT INTO systemgameallwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error2!'})
                    }
                

                }

            
                if(req.body.searchType === 'challenge') {
                if(req.body.correctWords !==undefined) {
                for(let j=0;j<correctWords.length;j++) {
                    const word= correctWords[j];
                    const addWord = await pool.query('INSERT INTO systemgamecorrectwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error3!'})
                    }
           

                }

                for(let k=0;k<incorrectWords.length;k++) {
                    const word= incorrectWords[k];
                    const addWord = await pool.query('INSERT INTO systemgameincorrectwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error4!'})
                    }
                  
                }

            }

        }


            if(req.body.searchType === 'search') {
                const grid_ = initializeGrid(14, 11);
                const { grid, markedWords, filteredMarkedwords } = markFixedWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                req.body.limitedWords );
                console.log('check mark this: ' + markedWords);
                const game_ = await pool.query
                ('SELECT * from systemgames where userid=$1 AND gamename=$2 AND searchtype=$3 AND totalwords=$4 AND gamelanguage=$5 AND gridtype=$6;'
                , [userId, gameName, searchType, totalWords, language, gridType]);
                for(var i=0;i<grid.length;i++) {
                   
                    for(var j=0;j<grid[i].length;j++) {
                    // console.log('alpha:'+grid[i][j]);
                
                        await pool.query('INSERT INTO gridstable(gameid, alphabet) VALUES($1, $2);', 
                        [game_.rows[0].gameid, grid[i][j]]);
                    }
                    
                }
            }
            else {
                const grid_ = initializeGrid(14, 11);
                const { grid, markedWords, filteredMarkedwords } = markFixedWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                incorrectWords, req.body.limitedWords );
                console.log('check mark this2: ' + markedWords);

                const game_ = await pool.query
                ('SELECT * from systemgames where userid=$1 AND gamename=$2 AND searchtype=$3 AND totalwords=$4 AND gamelanguage=$5 AND gridtype=$6;'
                , [userId, gameName, searchType, totalWords, language, gridType]);
                for(var i=0;i<grid.length;i++) {
                    for(var j=0;j<grid[i].length;j++) {
                        await pool.query('INSERT INTO gridstable(gameid, alphabet) VALUES($1, $2);', 
                        [game_.rows[0].gameid, grid[i][j]]);
                    }
                }
            }
                var newData={};
                newData['gameDetails']= data.rows[0];
                newData['gameAllWords'] = allWords;
                newData['gameCorrectWords'] = correctWords;
                newData['gameIncorrectWords'] = incorrectWords;
                newData['message'] = 'game created successfully';
                res.status(200).send(newData);
            }
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/deleteGame', async function (req, res) {
    try{

        await pool.query('DELETE from systemgames where gameid=$1;', [req.body.gameId]);

        await pool.query('DELETE from systemgameallwords where gameid=$1', [req.body.gameId]);

        await pool.query('DELETE from systemgamecorrectwords where gameid=$1', [req.body.gameId]);

        await pool.query('DELETE from systemgameincorrectwords where gameid=$1', [req.body.gameId]);

        await pool.query('DELETE from gridstable where gameid=$1', [req.body.gameId]);

            await pool.query('DELETE from gameleaderboards where gameid=$1', [req.body.gameId]);

            res.status(200).send({'message':'Game deleted successfully!'})
    }
    catch (err) {
        res.status(403).send({'message':err })
    }
}
);


app.post('/systemCreateGame', async function (req, res) {

    try{
   
    var userId= req.body?.userId;
    var gameName:string= req.body?.gameName;
    var totalWords = req.body?.totalWords;
    var limitedWords = req.body?.limitedWords;
    var language = req.body?.gameLanguage;
    var gameType = req.body?.gameType;
    var searchType = req.body?.searchType;
    var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);

    var allWords:[]=    JSON.parse(req.body?.allWords);

    var correctWords:[];
    var incorrectWords:[];
    if(req.body.correctWords!==undefined) {
        correctWords = JSON.parse( req.body?.correctWords);
        incorrectWords = JSON.parse( req.body?.incorrectWords);
    }

    var category = req.body.category;
    var topic = req.body.topic;

    if(category === '') {
        category = null
    }
    if(topic === '') {
        topic = null
    }
  

            const final= await pool.query
            ('INSERT INTO systemgames (userid,gamename,gametype,searchtype,totalwords,sharecode,gamelanguage,limitedwords,avgratings,playstatus, gridtype, category, topic) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13); '
            , [0, gameName,'system',searchType, totalWords, shareCode, language ,limitedWords, 0.0, 'unlimited' ,  req.body.gridType, category, topic])

            if(final.rowCount !=1) {
                res.status(400).send({'message':'There was an error!'})
            }
            else {
         
                const data= await pool.query('SELECT * FROM systemgames where gamename=$1 AND totalwords= $2 AND sharecode=$3;'
                , [gameName, totalWords, shareCode]);

                for(let i=0;i<allWords.length;i++) {
                    const word= allWords[i];
                    const addWord = await pool.query('INSERT INTO systemgameallwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error2!'})
                    }
                

                }

                if(req.body.correctWords !==undefined) {
                for(let j=0;j<correctWords.length;j++) {
                    const word= correctWords[j];
                    const addWord = await pool.query('INSERT INTO systemgamecorrectwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error3!'})
                    }
           

                }

                for(let k=0;k<incorrectWords.length;k++) {
                    const word= incorrectWords[k];
                    const addWord = await pool.query('INSERT INTO systemgameincorrectwords(gameid,words) VALUES($1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error4!'})
                    }
                  
                }

            }
                var newData={};
                newData['gameDetails']= data.rows[0];
                newData['gameAllWords'] = allWords;
                newData['gameCorrectWords'] = correctWords;
                newData['gameIncorrectWords'] = incorrectWords;
                newData['message'] = 'game created successfully';
                res.status(200).send(newData);
    
    
    }

}
catch (err)
{
    res.status(400).send({'message':err.message});
}    
});

app.post('/systemEditGame', async function (req, res) {

    try{
       var userId= req.body?.userId;
       var gameId:string= req.body?.gameId;
       var gameName:string= req.body?.gameName;
       var totalWords = req.body?.totalWords;
       var limitedWords = req.body?.limitedWords;
       var language = req.body?.gameLanguage;
       var gameType = req.body?.gameType;
       var searchType = req.body?.searchType;
       var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);
   
       var allWords:[]=    JSON.parse(req.body?.allWords);
   
       var correctWords:[];
       var incorrectWords:[];
       console.log(req.body.correctWords);
       if(req.body.correctWords !== undefined) {
       correctWords= JSON.parse( req.body.correctWords);
       incorrectWords = JSON.parse( req.body.incorrectWords);
       }
   

               const final= await pool.query
               ('UPDATE systemgames SET gamename=$1, totalwords=$2, sharecode= $3, limitedwords = $4, gamelanguage = $5, gametype=$7, searchtype=$8 , gridType=$9 WHERE gameid=$6; '
               , [gameName, totalWords, shareCode, limitedWords, language, gameId, gameType, searchType, req.body.gridType])
   
   
   
               if(final.rowCount !=1) {
                   res.status(400).send({'message':'There was an error1!'})
               }
               else {
   
                   if(allWords.length>0 ) {
                       const delete_1= await pool.query('DELETE FROM systemgameallwords WHERE gameid=$1', [gameId]);
   
                       if(correctWords !== undefined) {
                       const delete_2= await pool.query('DELETE FROM systemgamecorrectwords WHERE gameid=$1', [gameId]);
                       const delete_3= await pool.query('DELETE FROM systemgameincorrectwords WHERE gameid=$1', [gameId]);
                       }
   
                   for(let i=0;i<allWords.length;i++) {
                       const word= allWords[i];
                       const addWord = await pool.query('INSERT INTO systemgameallwords(gameid,words) VALUES($1, $2)', [gameId, word]);
   
                       if(addWord.rowCount !=1) {
                           res.status(400).send({'message':'There was an error2!'})
                       }
                   
   
                   }
   
                   if(correctWords !== undefined) {
   
                   for(let j=0;j<correctWords.length;j++) {
                       const word= correctWords[j];
                       const addWord = await pool.query('INSERT INTO systemgamecorrectwords(gameid,words) VALUES($1, $2);', [gameId, word]);
   
                       if(addWord.rowCount !=1) {
                           res.status(400).send({'message':'There was an error3!'})
                       }
              
   
                   }
   
                   for(let k=0;k<incorrectWords.length;k++) {
                       const word= incorrectWords[k];
                       const addWord = await pool.query('INSERT INTO systemgameincorrectwords(gameid,words) VALUES($1, $2);', [gameId, word]);
   
                       if(addWord.rowCount !=1) {
                           res.status(400).send({'message':'There was an error4!'})
                       }
                     
   
                   }
               }
                   }
                   else {
                       const allwords = await pool.query
                       ('SELECT * FROM systemgameallwords WHERE gameid=$1'
                       ,[gameId]);
                   
                       const corrwords = await pool.query
                       ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
                       ,[gameId]);
                   
                       const incorrwords = await pool.query
                       ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
                       ,[gameId]);
                       console.log(allwords.rows);
                       allWords = allwords.rows;
                       correctWords = corrwords.rows;
                       incorrectWords = incorrwords.rows;
                   }

                   
                   const data= await pool.query('SELECT * FROM systemgames where gamename=$1 AND totalwords= $2 AND sharecode=$3;'
                   , [gameName, totalWords, shareCode]);
   
                   var newData={};
                   newData['gameDetails']= data.rows[0];
                   newData['gameAllWords'] = allWords;
                   newData['gameCorrectWords'] = correctWords;
                   newData['gameIncorrectWords'] = incorrectWords;
                   newData['message'] = 'game updated successfully';
                   res.status(200).send(newData);
               }
          
   
   }
   catch (err)
   {
       res.status(400).send({'message':err.message});
   }
   });
app.post('/editGame', async function (req, res) {

 try{
    var userId= req.body?.userId;
    var gameId:string= req.body?.gameId;
    var gameName:string= req.body?.gameName;
    var totalWords = req.body?.totalWords;
    var limitedWords = req.body?.limitedWords;
    var language = req.body?.gameLanguage;
    var gameType = req.body?.gameType;
    var searchType = req.body?.searchType;
    var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);

    var allWords:[]=    JSON.parse(req.body?.allWords);

    var correctWords:[];
    var incorrectWords:[];
    console.log(req.body.correctWords);
    if(req.body.correctWords !== undefined) {
    correctWords= JSON.parse( req.body.correctWords);
    incorrectWords = JSON.parse( req.body.incorrectWords);
    }
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body?.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body?.accessToken) {

            const final= await pool.query
            ('UPDATE systemgames SET gamename=$1, totalwords=$2, sharecode= $3, limitedwords = $4, gamelanguage = $5, gametype=$7, searchtype=$8 , gridType=$9 WHERE gameid=$6; '
            , [gameName, totalWords, shareCode, limitedWords, language, gameId, gameType, searchType, req.body.gridType])



            if(final.rowCount !=1) {
                res.status(400).send({'message':'There was an error1!'})
            }
            else {

                if(allWords.length>0 ) {
                    const delete_1= await pool.query('DELETE FROM systemgameallwords WHERE gameid=$1', [gameId]);

                    if(correctWords !== undefined) {
                    const delete_2= await pool.query('DELETE FROM systemgamecorrectwords WHERE gameid=$1', [gameId]);
                    const delete_3= await pool.query('DELETE FROM systemgameincorrectwords WHERE gameid=$1', [gameId]);
                    }

                for(let i=0;i<allWords.length;i++) {
                    const word= allWords[i];
                    const addWord = await pool.query('INSERT INTO systemgameallwords(gameid,words) VALUES($1, $2)', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error2!'})
                    }
                

                }

                if(correctWords !== undefined) {

                for(let j=0;j<correctWords.length;j++) {
                    const word= correctWords[j];
                    const addWord = await pool.query('INSERT INTO systemgamecorrectwords(gameid,words) VALUES($1, $2);', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error3!'})
                    }
           

                }

                for(let k=0;k<incorrectWords.length;k++) {
                    const word= incorrectWords[k];
                    const addWord = await pool.query('INSERT INTO systemgameincorrectwords(gameid,words) VALUES($1, $2);', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error4!'})
                    }
                  

                }
            }
                }
                else {
                    const allwords = await pool.query
                    ('SELECT * FROM systemgameallwords WHERE gameid=$1'
                    ,[gameId]);
                
                    const corrwords = await pool.query
                    ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
                    ,[gameId]);
                
                    const incorrwords = await pool.query
                    ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
                    ,[gameId]);
                    console.log(allwords.rows);
                    allWords = allwords.rows;
                    correctWords = corrwords.rows;
                    incorrectWords = incorrwords.rows;
                }
                const data= await pool.query('SELECT * FROM systemgames where gamename=$1 AND totalwords= $2 AND sharecode=$3;'
                , [gameName, totalWords, shareCode]);

                await pool.run('DELETE from gridstable where gameid=$1;', [gameId]);
                if(req.body.searchType === 'search') {
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = markFixedWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
                    req.body.limitedWords );
                    console.log('check mark this: ' + markedWords);
    
                    for(var i=0;i<grid.length;i++) {
                        for(var j=0;j<grid[i].length;j++) {
                            await pool.query('INSERT INTO gridstable(gameid, alphabet) VALUES($1, $2);', 
                            [gameId, grid[i][j]]);
                        }
                    }
                }
                else {
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = markFixedWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
                    incorrectWords, req.body.limitedWords );
                    console.log('check mark this: ' + markedWords);
    
                    for(var i=0;i<grid.length;i++) {
                        for(var j=0;j<grid[i].length;j++) {
                            await pool.query('INSERT INTO gridstable(gameid, alphabet) VALUES($1, $2);', 
                            [gameId, grid[i][j]]);
                        }
                    }
                }
                var newData={};
                newData['gameDetails']= data.rows[0];
                newData['gameAllWords'] = allWords;
                newData['gameCorrectWords'] = correctWords;
                newData['gameIncorrectWords'] = incorrectWords;
                newData['message'] = 'game updated successfully';
                res.status(200).send(newData);
            }
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getAllUserGames', async (req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const allwords={}
            const data= await pool.query
            ('SELECT * FROM systemgames where userid=$1 AND searchtype=$2;'
                , [req.body.userId, req.body.type]);


                var newData ={};
                newData['message'] = 'All user game returned successfully';
                newData['allGames'] = data.rows;
               
                res.status(200).send(newData);
            
        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getGameWords', async (req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

    const allwords = await pool.query
    ('SELECT * FROM systemgameallwords WHERE gameid=$1'
    ,[req.body.gameid]);

    const corrwords = await pool.query
    ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
    ,[req.body.gameid]);

    const incorrwords = await pool.query
    ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
    ,[req.body.gameid]);

    res.send({'message':'All word details',"allWords":allwords.rows, "correctWords":corrwords.rows, "incorrectWords":incorrwords.rows});
}
else {
    res.status(401).send({'message':'Invalid accessToken'})
}
}
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getSingleUserGames', async (req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        const game = await pool.query('SELECT * FROM systemgames WHERE gameId =$1',[req.body.gameid]);

        if(game.rows.length <1) {   
            res.status(401).send({'message':'No game found'})
        }
        else {
            if(data.rows[0].accesstoken === req.body.accessToken) {

                const rating_total = await pool.query('SELECT * FROM gameRatings WHERE gameid=$1;',[req.body.gameid]);
                const ratingcount = rating_total.rows.length;
                const avg_rating = await pool.query('SELECT AVG(rating) FROM gameRatings WHERE gameid=$1;',[req.body.gameid]);
                const number_avg =  avg_rating.rows[0].avg;
                
                const ratingData = {'totalRating': ratingcount, 'avgRating': number_avg};

            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[req.body.gameid]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[req.body.gameid]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[req.body.gameid]);
        
            res.send({'gameDetails':game.rows[0],'gameRatings':ratingData,"allWords":allwords.rows, "correctWords":corrwords.rows, "incorrectWords":incorrwords.rows});

        }
        else {
            res.status(401).send({'message':'Invalid accessToken'})
        }
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
})

app.post('/duplicateGame', async (req, res) => {
    
    try{
        const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);
    
        if(data.rows.length <1) {   
            res.status(401).send({'message':'Invalid userId'})
        }
        else {
    
            const game = await pool.query('SELECT * FROM systemgames WHERE gameId =$1',[req.body.gameid]);
    
            if(game.rows.length <1) {   
                res.status(404).send({'message':'No game found'})
            }
            else {
                if(data.rows[0].accesstoken === req.body.accessToken) {
    
                const allwords = await pool.query
                ('SELECT * FROM systemgameallwords WHERE gameid=$1'
                ,[req.body.gameid]);
            
                const corrwords  = await pool.query
                ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
                ,[req.body.gameid]);
            
                const incorrwords = await pool.query
                ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
                ,[req.body.gameid]);
                
            
        
                var playStatus;
                var shareCode = generateUserName( game.rows[0].gamename.toLowerCase().replaceAll(" ","") , 4);
               
                if(data.rows[0].subscriptionstatus === '1year' || data.rows[0].subscriptionstatus=== '1month') {
                    playStatus = 'unlimited';
                }
                else {
                    playStatus = 'limited';
                }
            const newGame = 
            await pool.query
            ('INSERT INTO systemgames (userid,gamename,gametype,topic,category,searchtype,totalwords,sharecode,gamelanguage,limitedwords,avgratings,totalplayed, playstatus) VALUES($8,$1,$2,null,null, $3, $4,$5,$7, $6, null, 0, $9); '
            , [game.rows[0].gamename+' - copy',game.rows[0].gametype,game.rows[0].searchtype, 
            allwords.rows.length, shareCode, game.rows[0].limitedwords, game.rows[0].gamelanguage, req.body.userId, playStatus])
                
            
            const gameMade = 
            await pool.query('SELECT * from systemgames where gamename=$1 AND gametype=$2 AND searchtype=$3 AND gamelanguage=$4;',
            [game.rows[0].gamename+' - copy',game.rows[0].gametype,game.rows[0].searchtype,game.rows[0].gamelanguage] );

            console.log(gameMade.rows[0].gameid);

            const allWords= []
                for(var i=0; i<allwords.rows.length; i++) {
                    console.log(allwords.rows[i].words);
                    allWords.push(allwords.rows[i].words);
                    await pool.query('INSERT INTO systemgameallwords(gameid,words) VALUES($1, $2);',
                     [gameMade.rows[0].gameid,allwords.rows[i].words ]);
                
                }
                
                if(game.rows[0].searchtype === 'challenge') {

                for(var i=0; i<corrwords.rows.length; i++) {
                    await pool.query('INSERT INTO systemgamecorrectwords(gameid,words) VALUES($1, $2);', [gameMade.rows[0].gameid,corrwords.rows[i].words ]);
                }
                for(var i=0; i<incorrwords.rows.length; i++) {
                    await pool.query('INSERT INTO systemgameincorrectwords(gameid,words) VALUES($1, $2);', [gameMade.rows[0].gameid,incorrwords.rows[i].words ]);
                }
            
                }
                const gameGrid = await pool.query('SELECT * from gridstable WHERE gameid=$1; ', [req.body.gameid]);

                // console.log('gridMade'+gameGrid.rows.length);
                for(var i=0;i<gameGrid.rows.length; i++) {
                    // console.log(gameGrid.rows[i].alphabet);
                    await pool.query('INSERT INTO gridstable(gameid, alphabet) VALUES($1, $2);', 
                    [gameMade.rows[0].gameid, gameGrid.rows[i].alphabet])
                }
            
                const allgames = await pool.query('SELECT * FROM systemgames where userid = $1;', [req.body.userId]);

                res.send({'message':'game duplicated!', 'allGames':allgames.rows});
    
            }
            else {
                res.status(401).send({'message':'Invalid accessToken'})
            }
            }
        }
    }
    catch (err)
    {
        res.status(400).send({'message':err.message});
    }
})

app.post('/getGameByCode', async (req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].gamesleft > 0) {
        const game = await pool.query('SELECT * FROM systemgames WHERE sharecode =$1',[req.body.sharecode]);

        if(game.rows.length <1) {   
            res.status(401).send({'message':'No game found'})
        }
        else {
            const gameid= game.rows[0].gameid;

            if(game.rows[0].totalplayed < 6 || game.rows[0].playstatus === 'unlimited') {
            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[gameid]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[gameid]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[gameid]);

            var allWords=[];
            var correctWords=[];
            var incorrectWords=[];
    
            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(allwords.rows[i].words);
            }
    
            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(cleanWord(String(corrwords.rows[i].words)));
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(cleanWord(incorrwords.rows[i].words));
            }
    
            var limited_words =[];
            var filtered_words = []
        
            var crossword;
            var singleGame =  game.rows[0];
      
            if(singleGame?.searchtype === 'search') {


            if(singleGame?.gridtype === 'fixed') {

                // Get grid of the game;

                const grid = await pool.query('SELECT * from gridsTable where gameid=$1', [singleGame?.gameid]);

                const temp_grid = []
                for(let i = 0; i < grid.rows.length; i++) {
                    temp_grid.push(grid.rows[i].alphabet);

                }
                const grid_list = [];
                const numberOfSublists = 14;
                const elementsPerSublist = Math.ceil(temp_grid.length / numberOfSublists);
                
                for (let i = 0; i < temp_grid.length; i += elementsPerSublist) {
                    const sublist = temp_grid.slice(i, i + elementsPerSublist);
                    grid_list.push(sublist);
                  }
              
              
                    limited_words = allWords;
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid_list;
          
        
        
            }
            else {
                if(singleGame?.gamelanguage === 'es') {
    
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = 
                    markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', singleGame?.limitedwords );
                    console.log('marked: '+markedWords);
                      
                    for(let i=0; i <= singleGame?.limitedwords; i++) {
                            // console.log(i);
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                 
                    } 
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
        
                else {
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } =
                     markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , singleGame?.limitedwords);
                    console.log('marked: '+markedWords);
                      
                    for(let i=0; i <= singleGame?.limitedwords; i++) {
                            // console.log(i);
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                 
                    } 
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
            }
        }
        else {
            
            if(singleGame?.gridtype === 'fixed') {

                // Get grid of the game;

                const grid = await pool.query('SELECT * from gridsTable where gameid=$1', [singleGame?.gameid]);
                const grid_list = [];
                const numberOfSublists = 14;
                const elementsPerSublist = Math.ceil(grid.rows.length / numberOfSublists);
                
                const temp_grid = []
                for(let i = 0; i < grid.rows.length; i++) {
                    temp_grid.push(grid.rows[i].alphabet);

                }

                for (let i = 0; i < temp_grid.length; i += elementsPerSublist) {
                    const sublist = temp_grid.slice(i, i + elementsPerSublist);
                    grid_list.push(sublist);
                  }
              
              
                    limited_words = allWords;
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid_list;
          
        
        
          
        
        
            }

            else {
                if(singleGame?.gamelanguage === 'es') {
    
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } = 
                    markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', incorrectWords, singleGame?.limitedwords );
                    console.log('marked: '+markedWords);
                      
                    for(let i=0; i <= singleGame?.limitedwords; i++) {
                            // console.log(i);
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                 
                    } 
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
        
                else {
                    const grid_ = initializeGrid(14, 11);
                    const { grid, markedWords, filteredMarkedwords } =
                     markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' ,incorrectWords,  singleGame?.limitedwords);
                    console.log('marked: '+markedWords);
                      
                    for(let i=0; i <= singleGame?.limitedwords; i++) {
                            // console.log(i);
                            limited_words.push(randomLimited(limited_words, markedWords));
                        
                 
                    } 
                    limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                    filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                    crossword = grid
                }
            }
        }

        const finalWords= jcc.upperCaseAll(crossword);

       
        
            res.send({'gameDetails':game.rows[0],"allWords":allWords, 
            "correctWords":correctWords, "incorrectWords":incorrectWords, 'limitedWords':limited_words, 
            "filteredWords":filtered_words
        , "crossword_grid":crossword});

        }
        else {
            res.status(401).send({'message':'You cannot play this game as this game already reached the limit!'})
        }
    }
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }
}

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getGameByCode_backup', async (req, res) => {

    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].gamesleft > 0) {
        const game = await pool.query('SELECT * FROM systemgames WHERE sharecode =$1',[req.body.sharecode]);

        if(game.rows.length <1) {   
            res.status(401).send({'message':'No game found'})
        }
        else {
            const gameid= game.rows[0].gameid;
            const allwords = await pool.query
            ('SELECT * FROM systemgameallwords WHERE gameid=$1'
            ,[gameid]);
        
            const corrwords = await pool.query
            ('SELECT * FROM systemgamecorrectwords WHERE gameid=$1'
            ,[gameid]);
        
            const incorrwords = await pool.query
            ('SELECT * FROM systemgameincorrectwords WHERE gameid=$1'
            ,[gameid]);

            var allWords=[];
            var correctWords=[];
            var incorrectWords=[];
    
            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(allwords.rows[i].words);
            }
    
            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(cleanWord(String(corrwords.rows[i].words)));
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(cleanWord(incorrwords.rows[i].words));
            }
    

            var limited_words =[];
            var filtered_words = []

            // var allFinalWords=[];

            // for(let i=0; i<allwords.rows.length; i++) {
                // allFinalWords.push( allwords.rows[i].words)
            // }
            // if(game.rows[0]?.limitedwords !==null) {
                // var num;
                // if(allFinalWords.length< game.rows[0]?.limitedwords) {
                    // num =allFinalWords.length;
                // }
                // else{
                    // num =  game.rows[0]?.limitedwords;
                // }
            // for(let i=0; i<num; i++) {
                // limited_words.push(randomLimited(limited_words, allFinalWords));
        
            // }
            // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words));
        // }
        // else {
            // limited_words = allwords;
            // filtered_words.push(randomLimitedWithFilter(filtered_words, limited_words))
        // }
        

            var crossword;
            var singleGame =  game.rows[0];
      
            if(singleGame?.searchtype === 'search') {
                
                if(singleGame?.gamelanguage === 'es') {
        
                const grid_ = initializeGrid(14, 11);
                console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                const { grid, markedWords, filteredMarkedwords } = 
                markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', req.body.words_limit );
                console.log('marked: '+markedWords);
        
                  
                for(let i=0; i <= req.body.words_limit; i++) {
                        // console.log(i);
                        limited_words.push(randomLimited(limited_words, markedWords));
                    
             
                } 
                limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                crossword = grid
            }
    
            else {
                const grid_ = initializeGrid(14, 11);
                console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                const { grid, markedWords, filteredMarkedwords } =
                 markWordsInGrid(grid_, allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , req.body.words_limit );
                console.log('marked: '+markedWords);

                  
                for(let i=0; i <= req.body.words_limit; i++) {
                        // console.log(i);
                        limited_words.push(randomLimited(limited_words, markedWords));
                    
             
                } 
                limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                crossword = grid
            }
            
                }
    
                else {
                    if(singleGame?.gamelanguage === 'es') {
        
                        const grid_ = initializeGrid(14, 11);
                        console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                        const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
                        , incorrectWords , req.body.words_limit);
                       console.log('marked: '+markedWords);
                
                  
                for(let i=0; i <= req.body.words_limit; i++) {
                        // console.log(i);
                        limited_words.push(randomLimited(limited_words, markedWords));
                }
             
               
                limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                crossword = grid
                    }
            
                    else {
                        const grid_ = initializeGrid(14, 11);
                        console.log('originalArray: '+allWords);
                    console.log('shuffledArray: '+shuffleArray(allWords));
                        const { grid, markedWords, filteredMarkedwords } = markWordsInGrid2(grid_, allWords, 
                            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , incorrectWords, req.body.words_limit  );
                            console.log('marked: '+markedWords);
                
                            for(let i=0; i <= req.body.words_limit; i++) {
                                    // console.log(i);
                                    limited_words.push(randomLimited(limited_words, markedWords));
                            }
                         
                           
                            limited_words = Array.from(limited_words).filter(e => e !== 'undefined');
                            filtered_words.push(randomLimitedWithFilter(filtered_words[0], limited_words));
                            crossword = grid
                    }
                }

        const finalWords= jcc.upperCaseAll(crossword);

       
        
            res.send({'gameDetails':game.rows[0],"allWords":allWords, 
            "correctWords":correctWords, "incorrectWords":incorrectWords, 'limitedWords':limited_words, 
            "filteredWords":filtered_words
        , "crossword_grid":crossword});

        }
    }
    else {
        res.status(401).send({'message':'Cannot play more as gamesleft is 0'})
    }
}

}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});
app.post('/updateUserSubscriptionStatus', async (req, res) => {
    try{
    var status = req.body.subStatus;
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {
        const changeStatus = await pool.query('UPDATE usertable SET subscriptionStatus = $1 WHERE id = $2', 
        [status, req.body.userId]);

        if(changeStatus.rowCount !=1) {
            res.status(400).send({'message':'There was an error!'})
        }
        else {

            var today = new Date();
            var futureDate = new Date();
            const yyyy = today.getFullYear();
            let mm:any = today.getMonth() + 1; // Months start at 0!
            let dd:any = today.getDate();
            var formattedFuture;
            var formattedToday;
            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

     
            if(status === '1month') {
            futureDate.setDate(futureDate.getDate()+30);
            const yyyy_ = futureDate.getFullYear();
            let mm_:any = futureDate.getMonth() + 1; // Months start at 0!
            let dd_:any = futureDate.getDate();

            formattedFuture = yyyy_+ '/' + mm_ + '/' + dd_;
            formattedToday = yyyy + '/' + mm + '/' + dd;
            console.log(formattedToday); 
            console.log(formattedFuture); 
            const limit =  await pool.query('SELECT * from systemsettings;');
            await pool.query('UPDATE usertable set gamesleft=$1 where id=$2', [limit.rows[0].gameslimit, req.body.userId])
            await pool.query('UPDATE systemgames set playstatus=$1 where userid=$2',['unlimited',req.body.userId]);
            }
            else if(status === '1year') {
                futureDate.setDate(futureDate.getDate()+365);
                const yyyy_ = futureDate.getFullYear();
                let mm_:any = futureDate.getMonth() + 1; // Months start at 0!
                let dd_:any = futureDate.getDate();
    
                formattedFuture = yyyy_+ '/' + mm_ + '/' + dd_;
                formattedToday = yyyy + '/' + mm + '/' + dd;
                console.log(formattedToday); 
                console.log(formattedFuture); 
                const limit =  await pool.query('SELECT * from systemsettings;');
                await pool.query('UPDATE usertable set gamesleft=$1 where id=$2', [limit.rows[0].gameslimit, req.body.userId])

                await pool.query('UPDATE systemgames set playstatus=$1 where userid=$2',['unlimited',req.body.userId]);
            }
            else {
                formattedFuture = null;
                formattedToday = null;
            }

            await pool.query('UPDATE subcriptionstatus SET  subscriptiontype=$4 , startdate=$1 , enddate=$2 WHERE userid=$3;', 
            [formattedToday, formattedFuture, req.body.userId, status]);


            const parseData = {'message':String('Updated subscription Status to ')
            .toString().concat(status), 'subcriptionStatus':status};
            res.status(200).send(parseData);
        }

    }
    else {
        res.status(401).send({'message':'Invalid accessToken'})
    }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getSubscriptionStatus', async (req, res) => {

    try{
    var status = req.body.subStatus;
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const data = await pool.query('SELECT * FROM subcriptionstatus WHERE userid=$1', [req.body.userId]);
            const row = data.rows[0];

            res.status(200).send({'message':'Subcription returned successfully', 'subscriptionDetails':row});
        
        }
}
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
})

app.post('/addGameRating', async (req, res) => {
    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);
    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

          const addrating=  await pool.query('INSERT INTO gameRatings VALUES(default, $1, $2, $3);', [
                req.body.gameid, req.body.userId, req.body.rating]);

                const avg_rating = await pool.query('SELECT AVG(rating) FROM gameRatings WHERE gameid=$1;',[req.body.gameid]);
                const number_avg = parseFloat(String( avg_rating.rows[0].avg).toString().substring(0,3));
                 
                await pool.query('UPDATE systemgames set avgratings=$1 where gameid=$2;',[number_avg, req.body.gameid ]);

                res.status(200).send({'message': 'Added rating to game successfully!'});
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});

app.post('/getGameRating', async (req, res) => {
    try{
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(401).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {
            const rating_total = await pool.query('SELECT * FROM gameRatings WHERE gameid=$1;',[req.body.gameid]);
            const number_total = rating_total.rows.length;
            const avg_rating = await pool.query('SELECT AVG(rating) FROM gameRatings WHERE gameid=$1;',[req.body.gameid]);
            const number_avg =  avg_rating.rows[0].avg;
            res.send({'message':'Ratings got successfully!', 'averageRating':number_avg,
             'totalRating':number_total});
        }
    }
}
catch (err)
{
    res.status(400).send({'message':err.message});
}
});