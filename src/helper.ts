import { json } from "body-parser";

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
export const englishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];

export const spanishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];

export function randomLimited(limited_List:any[], words:any[]) {
    var wordReturn;
    wordReturn = words.splice(Math.floor(Math.random() * (words.length + 1)), 1)[0];
    if(wordReturn === undefined) {
       return wordReturn = randomLimited(limited_List, words)
    }
   // console.log(wordReturn)
  return wordReturn;
  }

export function generateAccessToken (userName: string) {
   // var token = jwt.sign({ id: userName}, 'secret', {
   //  });

   var token = crypto.randomBytes(17).toString('hex');
   token = userName.substring(0,userName.length/2).toString() + token + userName.substring(userName.length/2
   ,userName.length).toString();
   return token;
}

export function generateUserName(username:string, length) {
   let result = '';
   const characters = '0123456789';
   const charactersLength = characters.length;
   let counter = 0;
   while (counter < length) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
     counter += 1;
   }
   return username+result;
}
