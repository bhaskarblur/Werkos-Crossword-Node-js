require('dotenv').config()
import express from 'express';
import { generateAccessToken, generateUserName } from '../helper/helper';
const app = express.Router();

export function getRouter() {
    return app;
}

const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: "RWSryOPhfHmTgWHcLJcO",
    port: process.env.PORT,
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

            var today = Date.now();
        

         console.log(today);
                     
            // if(gamestime !==null) {
         //    console.log(gamestime < today);

            
              
            

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


app.post('/getSingleUserGames', async (req, res) => {

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
