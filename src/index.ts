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
  user: 'crossword2023',
  host: 'dpg-cik5ep6nqql0l1vtktbg-a.singapore-postgres.render.com',
  database: 'crossword_y0sa',
  password: 'TsPTjHou29lCalXthmfxvq2sLtCppVYH',
  port: 5432,
  ssl: true,
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

app.post('/topicwise_crossword', async (req, res) => {

    var topic = req.body.topic;
    var category = req.body.category;
    var type= req.body.type;

    var data:any = null;
        data = await pool.query
        ('SELECT * FROM systemgames WHERE topic=$1 AND category=$2;',[topic, category]);
  
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
            correctWords.push(corrwords.rows[i].words);
        }
        
        for(let i=0; i<incorrwords.rows.length; i++) {
            incorrectWords.push(incorrwords.rows[i].words);
        }

        const response ={};
    response['gameDetails'] = row;
    response['allWords'] = allwords.rows;
 

        var limited_words =[];
        if(row.limitedwords !==null) {
            var num;
            if(allWords.length< row.limitedwords) {
                num =allWords.length;
            }
            else{
                num =  row.limitedwords;
            }
        for(let i=0; i<num; i++) {
            limited_words.push(randomLimited(limited_words, allWords));
           
        }
    }
    else {
        limited_words = allWords;
    }
    

        var crossword;
        if(req.body.language === 'es') {
        crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
    }
    else {
        crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
    }

    const finalWords= jcc.upperCaseAll(crossword);

   
    response['limitedWords'] = limited_words;

    if(req.body.type !== null) {
    if(req.body.type === 'challenge') {
    response['correctWords'] = correctWords;
    response['incorrectWords'] = incorrectWords;
    }
    else{

    }
}
    response['crossword_grid'] = finalWords;

    res.status(200).send(response);
  });

  app.post('/generateany_crossword', async (req, res) => {
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
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
        }
        else {
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
        }
    }
    else {
        if(req.body.language === 'es') {
            crossword = generateCrossword(allWords, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
        }
        else {
            crossword = generateCrossword(allWords, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
        }
    }

    const response={};
    response['allWords'] = JSON.parse(allWords);
    response['correctWords'] = JSON.parse(corrWords);
    response['incorrectWords'] = JSON.parse(incorrWords);
    response['crossword_grid'] = crossword;

    res.status(200).send(response);



  });
  app.post('/randomusergenerated_crossword',async (req, res) => {

    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {
            var allGames ;
            if(req.body.type === "challenge") {
                 allGames = await pool.query('select * from systemgames where gametype=$1 AND searchtype=$2;',['public', 'challenge'] );
            }
            else {
                 allGames = await pool.query('select * from systemgames where gametype=$1;',['public'] );
            }
           
            const singleGame = allGames.rows[Math.floor(Math.random() * (allGames.rows.length))];
            const gameId= singleGame.gameid;
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
                allWords.push(allwords.rows[i].words);
            }

            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(corrwords.rows[i].words);
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(incorrwords.rows[i].words);
            }

            const response ={};
        response['gameDetails'] = singleGame;
        response['allWords'] = allwords.rows;
     

            var limited_words =[];
            if(singleGame.limitedwords !==null) {
                var num;
                if(allWords.length< singleGame.limitedwords) {
                    num =allWords.length;
                }
                else{
                    num =  singleGame.limitedwords;
                }
            for(let i=0; i<num; i++) {
                limited_words.push(randomLimited(limited_words, allWords));
               
            }
        }
        else {
            limited_words = allWords;
        }
        

            var crossword;
            if(singleGame.gamelanguage === 'es') {
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
        }
        else {
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
        }

        const finalWords= jcc.upperCaseAll(crossword);

       
        response['limitedWords'] = limited_words;

     
        if(req.body.type === 'challenge'){
        response['correctWords'] = correctWords;
        response['incorrectWords'] = incorrectWords;
        }
        else{

      
    }
        response['crossword_grid'] = finalWords;

        res.status(200).send(response);
    }

}
  });


  app.post('/randomsystemgenerated_crossword', async (req, res) => {
    const token = await pool.query('select * from usertable where id=$1', [req.body.userId]);

    if(token.rows.length <1) {
        res.send({"message": "Invalid userId"});
    }
    else {
        if(token.rows[0].accesstoken === req.body.accessToken) {

            const allGames = await pool.query('select * from systemgames where gametype=$1;',['system'] );
            const singleGame = allGames.rows[Math.floor(Math.random() * (allGames.rows.length))];
            const gameId= singleGame.gameid;
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

            const allWords=[];
            const correctWords=[];
            const incorrectWords=[];

            for(let i=0; i<allwords.rows.length; i++) {
                allWords.push(allwords.rows[i].words);
            }

            for(let i=0; i<corrwords.rows.length; i++) {
                correctWords.push(corrwords.rows[i].words);
            }
            
            for(let i=0; i<incorrwords.rows.length; i++) {
                incorrectWords.push(incorrwords.rows[i].words);
            }

            console.log(allwords.rows.length);

            var limited_words =[];
            if(allWords.length > 0) {
            for(let i=0; i<req.body.words_limit; i++) {
                limited_words.push(randomLimited(limited_words, allWords));
            }
        }            

            var crossword;
            if(singleGame.gamelanguage === 'es') {
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' );
        }
        else {
            crossword = generateCrossword(limited_words, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
        }

        const finalWords= jcc.upperCaseAll(crossword);

        const response ={};
        response['gameDetails'] = singleGame;
        response['allWords'] = allwords.rows;
        response['limitedWords'] = limited_words;

        if(singleGame.searchtype === 'challenge'){
        response['correctWords'] = correctWords;
        response['incorrectWords'] = incorrectWords;
        }
        else{

        }
        response['crossword_grid'] = finalWords;

        res.status(200).send(response);
    }

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

                const subsStatus =   await pool.query('INSERT INTO subcriptionstatus VALUES(default, $1, $2, null, null);', 
                [id.rows[0].id, 'none']);
               
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

            const checksubs = await pool.query('SELECT * FROM subcriptionstatus WHERE userid=$1;', [userid]);

            if(checksubs.rows.length > 0){
                if(checksubs.rows[0].startdate !=null) {
                    const startDate = checksubs.rows[0].startdate;
                    const endDate = checksubs.rows[0].enddate;
        
                    console.log(startDate.toDateString(), endDate.toDateString());
                    if(startDate.toDateString() < endDate.toDateString()) {
                    
                        console.log('Subscription running');
                    }
                    else {
                        await pool.query('UPDATE usertable SET subscriptionstatus=$2 WHERE id=$1;'
                        ,[userid,'none']);
        
                        await pool.query
                        ('UPDATE subcriptionstatus SET subscriptiontype=$2, startdate=null, enddate=null WHERE userid=$1;',
                         [userid, 'none'])
                        console.log('Subscription ended');
                    }
                }

              
            }

            const gamestime = Date.parse(data.rows[0].gamesendeddatetime);
            var today = Date.now();
        

         console.log(today);
         console.log(gamestime);
                     
            if(gamestime !==null) {
             console.log(gamestime < today);

                if(gamestime < today) {
                    //gamesLeft reset
                    await pool.query
                    ('UPDATE userTable SET gamesleft=50 , gamesendeddatetime=null WHERE id=$1', [userid]);

                }
                else {}
              
            }

            const datanew = await pool.query('SELECT * FROM usertable WHERE id= $1;', [userid]);
            var data_ = datanew.rows[0];

            if(data_.subscriptionStatus === '1year' || data_.subscriptionStatus === '') {
                data_['subscriptionStatus'] = 50;
            }
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

            if (data.rows[0].gamesleft > 0) {
                const data_ = data.rows[0].gamesleft-1;

                if(data.rows[0].subscriptionstatus === '1year' || data.rows[0].subscriptionstatus=== '1month') {

                }
                else {
                    if(data_ < 1) {
                        const datenow_=new Date();
                        datenow_.setDate(datenow_.getDate() + 1)
                        const yyyy_ = datenow_.getFullYear();
                let mm_:any = datenow_.getMonth() + 1; // Months start at 0!
                let dd_:any = datenow_.getDate() ;
    
             const formattedToday = dd_ + '/' + mm_ + '/' + yyyy_;
                        await pool.query('UPDATE userTable SET gamesendeddatetime= $1 where id=$2;',[datenow_, userid])
                    }
                    await pool.query('UPDATE userTable SET gamesleft=$1 where id=$2;',[data_, userid]);
                }
              
            }
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
            ('SELECT * FROM gameleaderboards WHERE gameid= $1 ORDER BY timescore Limit 10;', [req.body.gameId]);
            
            var FinalData = {'message':'leaderboards fetched successfully'};
        
            const name = await pool.query ('SELECT * FROM systemgames WHERE gameid= $1',[req.body.gameId]);
 
            if(name.rows[0]!=null){
            const name_ = name.rows[0].gamename;
            FinalData['gameName']=name_;
        }
            FinalData['leaderboards'] = data_.rows;
            res.status(200).send(FinalData);
        }
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});

app.post('/getcatstopics', function (req, res) {
    var data={};
    data = topicList;
    data['message'] = "All categories & topics are available!";
    res.status(200).send(data);
});

app.post('/createGame', async function (req, res) {
    var userId= req.body.userId;
    var gameName:string= req.body.gameName;
    var totalWords = req.body.totalWords;
    var limitedWords = req.body.limitedWords;
    var language = req.body.gameLanguage;
    var gameType = req.body.gameType;
    var searchType = req.body.searchType;
    var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);

    var allWords:[]=    JSON.parse(req.body.allWords);
    var correctWords:[] = JSON.parse( req.body.correctWords);
    var incorrectWords:[] = JSON.parse( req.body.incorrectWords);

    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const final= await pool.query('INSERT INTO systemgames VALUES(default, default,$8,$1,$2,null,null, $3, $4,$5,$7, $6); '
            , [gameName,gameType,searchType, totalWords, shareCode, limitedWords, language, userId])

            if(final.rowCount !=1) {
                res.status(400).send({'message':'There was an error1!'})
            }
            else {
         
                const data= await pool.query('SELECT * FROM systemgames where gamename=$1 AND totalwords= $2 AND sharecode=$3;'
                , [gameName, totalWords, shareCode]);

                for(let i=0;i<allWords.length;i++) {
                    const word= allWords[i];
                    const addWord = await pool.query('INSERT INTO systemgameallwords VALUES(default, $1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error2!'})
                    }
                

                }

                for(let j=0;j<correctWords.length;j++) {
                    const word= correctWords[j];
                    const addWord = await pool.query('INSERT INTO systemgamecorrectwords VALUES(default, $1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error3!'})
                    }
           

                }

                for(let k=0;k<incorrectWords.length;k++) {
                    const word= incorrectWords[k];
                    const addWord = await pool.query('INSERT INTO systemgameincorrectwords VALUES(default, $1, $2)', [data.rows[0].gameid, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error4!'})
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
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});

app.post('/editGame', async function (req, res) {
    var userId= req.body.userId;
    var gameId:string= req.body.gameId;
    var gameName:string= req.body.gameName;
    var totalWords = req.body.totalWords;
    var limitedWords = req.body.limitedWords;
    var language = req.body.gameLanguage;
    var gameType = req.body.gameType;
    var searchType = req.body.searchType;
    var shareCode = generateUserName(  gameName.toLowerCase().replaceAll(" ","") , 4);

    var allWords:[]=    JSON.parse(req.body.allWords);
    var correctWords:[] = JSON.parse( req.body.correctWords);
    var incorrectWords:[] = JSON.parse( req.body.incorrectWords);

    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const final= await pool.query
            ('UPDATE systemgames SET gamename=$1, totalwords=$2, sharecode= $3, limitedwords = $4, gamelanguage = $5, gametype=$7, searchtype=$8 WHERE gameid=$6; '
            , [gameName, totalWords, shareCode, limitedWords, language, gameId, gameType, searchType])



            if(final.rowCount !=1) {
                res.status(400).send({'message':'There was an error1!'})
            }
            else {

                if(allWords.length>0 && correctWords.length>0 && incorrectWords.length >0) {
                    const delete_1= await pool.query('DELETE FROM systemgameallwords WHERE gameid=$1', [gameId]);
                    const delete_2= await pool.query('DELETE FROM systemgamecorrectwords WHERE gameid=$1', [gameId]);
                    const delete_3= await pool.query('DELETE FROM systemgameincorrectwords WHERE gameid=$1', [gameId]);


                for(let i=0;i<allWords.length;i++) {
                    const word= allWords[i];
                    const addWord = await pool.query('INSERT INTO systemgameallwords VALUES(default, $1, $2)', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error2!'})
                    }
                

                }

                for(let j=0;j<correctWords.length;j++) {
                    const word= correctWords[j];
                    const addWord = await pool.query('INSERT INTO systemgamecorrectwords VALUES(default, $1, $2);', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error3!'})
                    }
           

                }

                for(let k=0;k<incorrectWords.length;k++) {
                    const word= incorrectWords[k];
                    const addWord = await pool.query('INSERT INTO systemgameincorrectwords VALUES(default, $1, $2);', [gameId, word]);

                    if(addWord.rowCount !=1) {
                        res.status(400).send({'message':'There was an error4!'})
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
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});

app.post('/getAllUserGames', async (req, res) => {

    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const allwords={}
            const data= await pool.query
            ('SELECT * FROM systemgames where userid=$1;'
                , [req.body.userId]);


                var newData ={};
                newData['message'] = 'All user game returned successfully';
                newData['allGames'] = data.rows;
               
                res.status(200).send(newData);
            
        }
        else {
            res.status(403).send({'message':'Invalid accessToken'})
        }
    }
});

app.post('/getGameWords', async (req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
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
    res.status(403).send({'message':'Invalid accessToken'})
}
}
});

app.post('/getSingleUserGames', async (req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        const game = await pool.query('SELECT * FROM systemgames WHERE gameId =$1',[req.body.gameid]);

        if(game.rows.length <1) {   
            res.status(403).send({'message':'No game found'})
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
            res.status(403).send({'message':'Invalid accessToken'})
        }
        }
    }
})

app.post('/getGameByCode', async (req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        const game = await pool.query('SELECT * FROM systemgames WHERE sharecode =$1',[req.body.sharecode]);

        if(game.rows.length <1) {   
            res.status(403).send({'message':'No game found'})
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
        
            res.send({'gameDetails':game.rows[0],"allWords":allwords.rows, "correctWords":corrwords.rows, "incorrectWords":incorrwords.rows});

        }
    }
});

app.post('/updateUserSubscriptionStatus', async (req, res) => {
    var status = req.body.subStatus;
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
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

            formattedFuture = dd_ + '/' + mm_ + '/' + yyyy_;
            formattedToday = dd + '/' + mm + '/' + yyyy;
            console.log(formattedToday); 
            console.log(formattedFuture); 
            }
            else if(status === '1year') {
                futureDate.setDate(futureDate.getDate()+365);
                const yyyy_ = futureDate.getFullYear();
                let mm_:any = futureDate.getMonth() + 1; // Months start at 0!
                let dd_:any = futureDate.getDate();
    
                formattedFuture = dd_ + '/' + mm_ + '/' + yyyy_;
                formattedToday = dd + '/' + mm + '/' + yyyy;
                console.log(formattedToday); 
                console.log(formattedFuture); 
            }
            else {
                formattedFuture = null;
                formattedToday = null;
            }

            await pool.query('UPDATE subcriptionstatus SET  subscriptiontype=$4 , startdate=$1 , enddate=$2 WHERE userid=$3', 
            [formattedToday, formattedFuture, req.body.userId, status])

            const parseData = {'message':String('Updated subscription Status to ')
            .toString().concat(status), 'subcriptionStatus':status};
            res.status(200).send(parseData);
        }

    }
    else {
        res.status(403).send({'message':'Invalid accessToken'})
    }
    }

});

app.post('/getSubscriptionStatus', async (req, res) => {
    var status = req.body.subStatus;
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            const data = await pool.query('SELECT * FROM subcriptionstatus WHERE userid=$1', [req.body.userId]);
            const row = data.rows[0];

            res.status(200).send({'message':'Subcription returned successfully', 'subscriptionDetails':row});
        
        }
}

})

app.post('/addGameRating', async (req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
    }
    else {

        if(data.rows[0].accesstoken === req.body.accessToken) {

            await pool.query('INSERT INTO gameRatings VALUES(default, $1, $2, $3);', [
                req.body.gameid, req.body.userId, req.body.rating]);

                res.status(200).send({'message': 'Added rating to game successfully!'});
        }
    }
});

app.post('/getGameRating', async (req, res) => {
    const data= await pool.query('SELECT * FROM userTable WHERE Id= $1;', [req.body.userId]);

    if(data.rows.length <1) {   
        res.status(403).send({'message':'Invalid userId'})
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
});