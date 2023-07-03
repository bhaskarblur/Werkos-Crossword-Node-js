//License Type: ISC
//Author: Mir Taha Ali
const _ = require('lodash');

const caseCondition = (origKey, keyCase) => {
	let newKey = null;
	switch (keyCase){
		case 'pascal':
			newKey = _.startCase(_.camelCase(origKey)).replace(/ /g, '');//(origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
			break;
		case 'camel':
			newKey = _.camelCase(origKey)
			break;
		case 'kebab':
			newKey = _.kebabCase(origKey)
			break;
		case 'snake':
			newKey = _.snakeCase(origKey)
			break;
		case 'upper':
			newKey = _.toUpper(origKey)
			break;
		case'constant':
			newKey = _.upperCase(origKey).replace(/ /g, '_')
			break;
		case 'dot':
			newKey = _.lowerCase(origKey).replace(/ /g, '.')
			break;
		case 'path':
			newKey = _.lowerCase(origKey).replace(/ /g, '/')
			break;
		case 'lower':
			newKey = _.toLower(origKey)
			break;
		case 'sentence':
			newKey = _.upperFirst(_.lowerCase(origKey));
			break;
		case 'title':
			newKey = _.startCase(_.camelCase(origKey));
			break;
	}
	return newKey;
}

function keyConvertor(obj, keyCase) {
	if (typeof obj !== 'object' && obj !== null) {
		return obj;
	}
	let objectToSend, origKey, newKey, value
	if (obj instanceof Array) {
		return obj.map(function (value) {
			if (typeof value === "object") {
				value = keyConvertor(value, keyCase)
			}
			return value
		})
	} else {
		objectToSend = {}
		for (origKey in obj) {
			if (obj.hasOwnProperty(origKey)) {
				newKey = caseCondition(origKey, keyCase);
				value = obj[origKey]
				if (value instanceof Array || (value !== null && value.constructor === Object)) {
					value = keyConvertor(value, keyCase)
				}
				objectToSend[newKey] = value
			}
		}
	}
	return objectToSend
}

function allConvertor(obj, keyCase) {
	if (typeof obj !== 'object' && obj !== null) {
		return obj;
	}
	let objectToSend, origKey, newKey, value
	if (obj instanceof Array) {
		return obj.map(function (value) {
			if (typeof value === "object") {
				value = allConvertor(value, keyCase)
			}
			if (typeof value === 'string')
			{
				value = caseCondition(value, keyCase);
			}
			return value
		})
	} else {
		objectToSend = {}
		for (origKey in obj) {
			if (obj.hasOwnProperty(origKey)) {
				newKey = caseCondition(origKey, keyCase);
				value = obj[origKey]
				if (value instanceof Array || (value !== null && value.constructor === Object)) {
					value = allConvertor(value, keyCase)
				}
				else {
					if (typeof value === 'string')
						value = caseCondition(value, keyCase);
				}
				objectToSend[newKey] = value
			}
		}
	}
	return objectToSend
}

function valueConvertor(obj, keyCase) {
	if (typeof obj !== 'object' && obj !== null) {
		if (typeof obj !== 'string')
			return caseCondition(obj);
		else return obj;
	}
	let objectToSend, origKey, value
	if (obj instanceof Array) {
		return obj.map(function (value) {
			if (typeof value === "object") {
				value = valueConvertor(value, keyCase)
			}
			if (typeof value === 'string')
			{
				value = caseCondition(value, keyCase);
			}
			return value
		})
	} else {
		objectToSend = {}
		for (origKey in obj) {
			if (obj.hasOwnProperty(origKey)) {
				value = obj[origKey]
				if (value instanceof Array || (value !== null && value.constructor === Object)) {
					value = valueConvertor(value, keyCase)
				}
				else {
					if (typeof value === 'string')
						value = caseCondition(value, keyCase);
				}
				objectToSend[origKey] = value
			}
		}
	}
	return objectToSend
}

//-----------------------------------------------
const pascalCaseKeys = (obj) => {
	return keyConvertor(obj, 'pascal')
}
const camelCaseKeys = (obj) => {
	return keyConvertor(obj, 'camel')
}
const snakeCaseKeys = (obj) => {
	return keyConvertor(obj, 'snake')
}
const kebabCaseKeys = (obj) => {
	return keyConvertor(obj, 'kebab')
}
const upperCaseKeys = (obj) => {
	return keyConvertor(obj, 'upper')
}
const lowerCaseKeys = (obj) => {
	return keyConvertor(obj, 'lower')
}
const constantCaseKeys = (obj) => {
	return keyConvertor(obj, 'constant')
}
const dotCaseKeys = (obj) => {
	return keyConvertor(obj, 'dot')
}
const pathCaseKeys = (obj) => {
	return keyConvertor(obj, 'path')
}
const sentenceCaseKeys = (obj) => {
	return keyConvertor(obj, 'sentence')
}
const titleCaseKeys = (obj) => {
	return keyConvertor(obj, 'title')
}
//-------------------------------------------------
const pascalCaseValues = (obj) => {
	return valueConvertor(obj, 'pascal')
}
const camelCaseValues = (obj) => {
	return valueConvertor(obj, 'camel')
}
const snakeCaseValues = (obj) => {
	return valueConvertor(obj, 'snake')
}
const kebabCaseValues = (obj) => {
	return valueConvertor(obj, 'kebab')
}
const upperCaseValues = (obj) => {
	return valueConvertor(obj, 'upper')
}
const lowerCaseValues = (obj) => {
	return valueConvertor(obj, 'lower')
}
const constantCaseValues = (obj) => {
	return valueConvertor(obj, 'constant')
}
const dotCaseValues = (obj) => {
	return valueConvertor(obj, 'dot')
}
const pathCaseValues = (obj) => {
	return valueConvertor(obj, 'path')
}
const sentenceCaseValues = (obj) => {
	return valueConvertor(obj, 'sentence')
}
const titleCaseValues = (obj) => {
	return valueConvertor(obj, 'title')
}
//-------------------------------------------------
const pascalCaseAll = (obj) => {
	return allConvertor(obj, 'pascal')
}
const camelCaseAll = (obj) => {
	return allConvertor(obj, 'camel')
}
const snakeCaseAll = (obj) => {
	return allConvertor(obj, 'snake')
}
const kebabCaseAll = (obj) => {
	return allConvertor(obj, 'kebab')
}
const upperCaseAll = (obj) => {
	return allConvertor(obj, 'upper')
}
const lowerCaseAll = (obj) => {
	return allConvertor(obj, 'lower')
}
const constantCaseAll = (obj) => {
	return allConvertor(obj, 'constant')
}
const dotCaseAll = (obj) => {
	return allConvertor(obj, 'dot')
}
const pathCaseAll = (obj) => {
	return allConvertor(obj, 'path')
}
const sentenceCaseAll = (obj) => {
	return allConvertor(obj, 'sentence')
}
const titleCaseAll = (obj) => {
	return allConvertor(obj, 'title')
}
//----------------------------------------------

module.exports = {
	pascalCaseKeys,
	camelCaseKeys,
	snakeCaseKeys,
	kebabCaseKeys,
	upperCaseKeys,
	lowerCaseKeys,
	constantCaseKeys,
	dotCaseKeys,
	pathCaseKeys,
	sentenceCaseKeys,
	titleCaseKeys,
	//-------------------
	pascalCaseAll,
	camelCaseAll,
	snakeCaseAll,
	kebabCaseAll,
	upperCaseAll,
	lowerCaseAll,
	constantCaseAll,
	dotCaseAll,
	pathCaseAll,
	sentenceCaseAll,
	titleCaseAll,
	//---------------------
	pascalCaseValues,
	camelCaseValues,
	snakeCaseValues,
	kebabCaseValues,
	upperCaseValues,
	lowerCaseValues,
	constantCaseValues,
	dotCaseValues,
	pathCaseValues,
	sentenceCaseValues,
	titleCaseValues
};
