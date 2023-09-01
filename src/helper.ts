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
  return String(wordReturn)
  }

  export function randomLimitedWithFilter(limited_List:any[], words:any[]) {
    var listReturn = []
    // wordReturn = words.splice(Math.floor(Math.random() * (words.length + 1)), 1)[0];
    // if(wordReturn === undefined) {
      //  return wordReturn = randomLimited(limited_List, words)
    // }
   // console.log(wordReturn)

   for( var i = 0; i < words.length; i++) {
    listReturn.push(cleanWord(words[i]));
   }
   console.log('wordReturn', listReturn);
   return listReturn;
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

export function cleanWord(word) {
   const replacements = {
     'eÈÉÊËèéêë': 'E',
     'aÀÁÂÃÄÅàáâãäå': 'A',
     'b': 'B',
     'cÇç': 'C',
     'd': 'D',
     'f': 'F',
     'g': 'G',
     'h': 'H',
     'iÌÍÎÏìíîï': 'I',
     'j': 'J',
     'k': 'K',
     'l': 'L',
     'm': 'M',
     'n': 'N',
     'oÒÓÔÕÖØòóôõöø': 'O',
     'p': 'P',
     'q': 'Q',
     'r': 'R',
     'sŠš': 'S',
     't': 'T',
     'uÙÚÛÜùúûü': 'U',
     'v': 'V',
     'w': 'W',
     'x': 'X',
     'yŸÿ': 'Y',
     'zŽž': 'Z',
     'œ': 'Œ',
     'æ': 'Æ',
     'ð': 'Ð',
     'ñ': 'Ñ',
     'ý': 'Ý',
     'þ': 'Þ'
   };
 
   for (const k in replacements) {
     const chars = k.split('');
     for (const char of chars) {
       word = word.split(char).join(replacements[k]);
     }
   }
 
   // Remove spaces, dashes, periods, commas, and single quotes, and convert to uppercase
   return word.trim().replaceAll('.', '').replaceAll('-','').
   replaceAll('!','').replaceAll('_', '').replaceAll('@', '').replaceAll(',','').replaceAll('/','');
 }

