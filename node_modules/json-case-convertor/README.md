# JsonCaseConvertor
## Convert any json object key name and values case



JsonCaseConvertor can handle literraly any json object for case convertion. 
## Features

- Supported cases: Pascal, Camel, Snake, Kebab, Upper, Lower, Constant, Dot, Path, Sentence, Title
- Support array objects
- Support objects within objects
- Support object values case convertion
- Support object keys case convertion
- One line code implementation

## Installation

```npm
npm install json-case-convertor
```

## Usage

Import:

```javascript
const jcc = require('json-case-convertor')
```

Convert only object KEYS Names:

```javascript
const jsonData = { 
	"firstName": "John", 
	"lastName": "Wick", 
	"car": "Ford Mustang",
	"car2": null,
	"prize": 2000,
	"other" : ['sample1', 'sample2'],
	"other2" : {
		"location": "America",
		"longitude1": 23.4,
		"latitude1" : 23.11
	}
}
jcc.snakeCaseKeys(jsonData); //Convert all the keys of object to snake case
```

Output:

```sh
{
  first_name: 'John',
  last_name: 'Wick',
  car: 'Ford Mustang',
  car_2: null,
  prize: 2000,
  other: [ 'sample1', 'sample2' ],
  other_2: { location: 'America', longitude_1: 23.4, latitude_1: 23.11 }
}
```

Convert only object values:

```javascript
jcc.snakeCaseValues(jsonData) //Convert all the values of object to snake case
```

Output:

```sh
{
  firstName: 'john',
  lastName: 'wick',
  car: 'ford_mustang',
  car2: null,
  prize: 2000,
  other: [ 'sample_1', 'sample_2' ],
  other2: { location: 'america', longitude1: 23.4, latitude1: 23.11 }
}
```

Convert only object keys and values:

```javascript
jcc.snakeCaseAll(jsonData) //Convert all the values and keys of object to snake case
```
Output:

```sh
{
  first_name: 'john',
  last_name: 'wick',
  car: 'ford_mustang',
  car_2: null,
  prize: 2000,
  other: [ 'sample_1', 'sample_2' ],
  other_2: { location: 'america', longitude_1: 23.4, latitude_1: 23.11 }
}
```

### Functions

```javascript
const jcc = require('json-case-convertor')

jcc.pascalCaseKeys(jsonData)

jcc.camelCaseKeys(jsonData)

jcc.snakeCaseKeys(jsonData)

jcc.kebabCaseKeys(jsonData)

jcc.upperCaseKeys(jsonData)

jcc.lowerCaseKeys(jsonData)

jcc.constantCaseKeys(jsonData)

jcc.dotCaseKeys(jsonData)

jcc.pathCaseKeys(jsonData)

jcc.sentenceCaseKeys(jsonData)

jcc.titleCaseKeys(jsonData)

//-------------------------

jcc.pascalCaseAll(jsonData)

jcc.camelCaseAll(jsonData)

jcc.snakeCaseAll(jsonData)

jcc.kebabCaseAll(jsonData)

jcc.upperCaseAll(jsonData)

jcc.lowerCaseAll(jsonData)

jcc.constantCaseAll(jsonData)

jcc.dotCaseAll(jsonData)

jcc.pathCaseAll(jsonData)

jcc.sentenceCaseAll(jsonData)

jcc.titleCaseAll(jsonData)

//----------------------------
jcc.pascalCaseValues(jsonData)

jcc.camelCaseValues(jsonData)

jcc.snakeCaseValues(jsonData)

jcc.kebabCaseValues(jsonData)

jcc.upperCaseValues(jsonData)

jcc.lowerCaseValues(jsonData)

jcc.constantCaseValues(jsonData)

jcc.dotCaseValues(jsonData)

jcc.pathCaseValues(jsonData)

jcc.sentenceCaseValues(jsonData)

jcc.titleCaseValues(jsonData)

```

##### [Link to repo github](https://github.com/MIRTAHAALI/json-case-convertor)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

ISC
