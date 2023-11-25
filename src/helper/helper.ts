
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
export const englishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];

export const spanishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O",
"P", "Q", "R", "S","T", "U", "V","W", "X", "Y", "Z"];

export function randomLimited(limited_List:any[], words:any[]) {
    var wordReturn;

    wordReturn = words.splice(Math.floor(Math.random() * (words.length)), 1)[0];
    // if(!limited_List.includes(wordReturn)){
      return String(wordReturn);  
    // }

  }

  export function randomLimitedWithFilter(limited_List:any[], words:any[]) {
    var listReturn = []
    // wordReturn = words.splice(Math.floor(Math.random() * (words.length + 1)), 1)[0];
    // if(wordReturn === undefined) {
      //  return wordReturn = randomLimited(limited_List, words)
    // }
   // console.log(wordReturn)

   for( var i = 0; i < words.length; i++) {
    if(words[i] !== undefined) {
    listReturn.push(cleanWord(words[i]));
    }
   }
  //  console.log('wordReturn', listReturn);
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

export function generateShareCode(length) {
  var unix = Date.now() + ((Math.random()*100000).toFixed());
  var code = String(unix).substr(String(unix).length - 7);
  return code;
}
export function cleanWord(word: String) {
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
     'þ': 'Þ',
     '.': '',
     '-' :'',
     ' ' : '',
     "'" : '',
     '!' : '',
     '_' : '',
     '@' : '',
     ',' : '',
     '/'  : '',
   };
 
   for (const k in replacements) {
     const chars = k.split('');
     for (const char of chars) {
       word = word.split(char).join(replacements[k])
     }
   }
 
   // Remove spaces, dashes, periods, commas, and single quotes, and convert to uppercase
  //  return word.replaceAll('.', '').replaceAll('-','').replaceAll(' ','').replace("'","").
  //  replaceAll('!','').replaceAll('_', '').replaceAll('@', '').replaceAll(',','').replaceAll('/','');

  return word.trim();
  
 }



 export function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

export function mergeLists(list1, list2) {
  // Calculate the number of elements to take from each list
  const totalElements = list1.length + list2.length;
  var numElementsFromList1 = Math.ceil(0.6 * totalElements);
  var numElementsFromList2 = totalElements - numElementsFromList1;

  // Create a new list for the merged elements
  const mergedList = [];

  // Add elements from list1
  while (numElementsFromList1 > 0 && list1.length > 0) {
    const randomIndex = Math.floor(Math.random() * list1.length);
    mergedList.push(list1[randomIndex]);
    list1.splice(randomIndex, 1);
    numElementsFromList1--;
  }

  // Add elements from list2
  while (numElementsFromList2 > 0 && list2.length > 0) {
    const randomIndex = Math.floor(Math.random() * list2.length);
    mergedList.push(list2[randomIndex]);
    list2.splice(randomIndex, 1);
    numElementsFromList2--;
  }

  return mergedList;
}

export function generateRandomList(length: number, alphabets) {

  var list = []
  for (let i = 0; i < length; i++) {
    list.push(alphabets.charAt(Math.floor(Math.random() * length)));
  }

  return list;
}
