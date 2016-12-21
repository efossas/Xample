/* eslint-env node, es6 */
/*
	Title: Helper
	General helper functions for routes.
*/

/*
	Function: getTablePrefixFromPageType

	Given a page type ["page","guide"], this returns the table prefix used in the database.

	Parameters:

		pagetype - string, ["page","guide"]

	Returns:

		success - string, table prefix
        error - string, empty
*/
exports.getTablePrefixFromPageType = function(pagetype) {

    var prefix;
	switch(pagetype) {
        case "page":
            prefix = "bp"; break;
        case "guide":
            prefix = "lg"; break;
        default:
            prefix = "";
    }

    return prefix;
};

/*
	Function: getTempTablePrefixFromPageType

	Given a page type ["page","guide"], this returns the temporary table prefix used in the database.

	Parameters:

		pagetype - string, ["page","guide"]

	Returns:

		success - string, table prefix
        error - string, empty
*/
exports.getTempTablePrefixFromPageType = function(pagetype) {

    var prefix;
	switch(pagetype) {
        case "page":
            prefix = "bt"; break;
        case "guide":
            prefix = "lt"; break;
        default:
            prefix = "";
    }

    return prefix;
};

/*
	Function: randomText

	This returns a random string of 8 characters. It's used to generate random file names.

	Parameters:

		none

	Returns:

		success - string, 8 char string
*/
exports.randomText = function() {

	/* initialize return variable & list of charachters to grab from */
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	/* choose a random character and append it to "text". Do this 8 times */
    for(var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};
