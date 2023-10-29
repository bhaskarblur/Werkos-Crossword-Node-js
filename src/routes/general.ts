require('dotenv').config()
import express from 'express';
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

  console.log(req.body.categoryId);
  console.log(req.body.topicId);
  console.log(status);
  console.log(language);
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

app.post('/deleteCategoryTopic', async function (req, res) {
  try{
      const categoryid = req.body.categoryId;
      const topicid = req.body.topicId;
      const categoryName = req.body.categoryName;
      const language = req.body.language;
      const searchType = req.body.searchType;
      const status = req.body.status;
      console.log(req.body.topicId);
  
      const topicData = await pool.query('SELECT * from topics where id=$1', [topicid]);

      const topicName = topicData.rows[0].topicsname;

      await pool.query('DELETE from topics where id=$1',
      [topicid]);
      
      await pool.query('UPDATE systemgames set category = null , topic=null where topic=$1', [topicName]);

      res.status(200).send({'message': 'Topic deleted successfully!'});
  }
      catch (err)
  {
      res.status(400).send({'message':err.message});
  }
  });

  app.post('/systemupdateGameLimit', async function (req, res) {

    try{
        console.log('input: '+req.body.gamesLimit)
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