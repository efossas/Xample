/* eslint-env node, es6 */
/*
	Title: Helper
	General helper functions for routes.
*/

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