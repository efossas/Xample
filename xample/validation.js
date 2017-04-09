/* eslint-env node, es6 */
/*
	Title: Validation
	Functions used to validate data
*/

/*
    array:
        is Array
*/
exports.isArr = function(value) {
    return Array.isArray(value);
};

/*
    boolean:
        is boolean
        is 0 or 1
        is string '0' or '1'
        is string 'true' or 'false'
*/
exports.isBool = function(value) {
    if(typeof value === 'boolean') {
        return true;
    }
    switch(value) {
        case 0:
        case 1:
        case '0':
        case '1':
        case 'true':
        case 'false':
            return true;
        default:
            return false;
    }
};

/*
    integer:
        is number as integer
        is string that can convert to integer
*/
exports.isInt = function(value) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
};

/*
    numeric:
        is number
        is string that can be converted to number
*/
exports.isNumeric = function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

/*
    object:
        is object
        is string which can convert to object
*/
exports.isObj = function(value) {
    if(typeof value === 'object' && value !== null) {
        return true;
    } else {
        try {
            var x = JSON.parse(value);
            if(typeof x !== 'object' && x !== null) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
};

/*
    string:
        is string
*/
exports.isStr = function(value) {
    if(typeof value === 'string') {
        return true;
    } else {
        return false;
    }
};
