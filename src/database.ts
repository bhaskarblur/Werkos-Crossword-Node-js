import { generateAccessToken, generateUserName } from "./helper";
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'Bhaskar',
  host: 'localhost',
  database: 'crossword',
  password: 'bhanu=vasu1234',
  port: 10001,
})
export async function getUserName() {

   var userName= generateUserName("user", 4);
  //var userName = 'user4661'
    var token = generateAccessToken(userName);
   var status:{};
    const  data  =  await pool.query(`SELECT * FROM usertable WHERE username= $1;`, [userName]); //Checking if user already exists
    const  arr  =  data.rows;  
    if (arr.length  !=  0) {
        status =  getUserName();
         return {'message':'User already exists'};

    }
    else {
        console.log("User created");
       await pool.query(`Insert into usertable values (default,$1, $2, 50, 'none')`, [userName, token],(err) => 
       {
        if(err) {
              return {"message": err.message};
        }
        else {
            return {'message:':'user created successfully', 
        "userName":userName, "accessToken":token, "gamesLeft":50, 'subcriptionStatus':"none"};
        }
       });
     

    }
}

export async function setUserName(username:string) {

    return {"message:":"name updated successfully!", 
    "userName":username};
}