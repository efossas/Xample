/* eslint-env node, es6 */
/*
	Title: Page
	This is the back-end for Xample
*/

/*
	Section: Require Modules
	This section imports all modules.
*/

// <<<code>>>

/* load functions, for loading pages */
var l_editpage = require('./loads/editpage.js');
var l_editlg = require('./loads/editlg.js');
var l_explore = require('./loads/explore.js');
var l_home = require('./loads/home.js');
var l_notfound = require('./loads/notfound.js');
var l_page = require('./loads/page.js');
var l_profile = require('./loads/profile.js');
var l_start = require('./loads/start.js');

/* route functions, for ajax requeset asking for data */
var r_createlg = require('./routes/createlg.js');
var r_createpage = require('./routes/createpage.js');
var r_deletelg = require('./routes/deletelg.js');
var r_deletepage = require('./routes/deletepage.js');
var r_getlgs = require('./routes/getlgs.js');
var r_getpages = require('./routes/getpages.js');
var r_getprofiledata = require('./routes/getprofiledata.js');
var r_getsubjects = require('./routes/getsubjects.js');
var r_journalerror = require('./routes/journalerror.js');
var r_login = require('./routes/login.js');
var r_logout = require('./routes/logout.js');
var r_revertblocks = require('./routes/revertblocks.js');
var r_saveblocks = require('./routes/saveblocks.js');
var r_saveprofile = require('./routes/saveprofile.js');
var r_signup = require('./routes/signup.js');
var r_uploadmedia = require('./routes/uploadmedia.js');

// <<<fold>>>

/*
	Section: Export Modules
	This section bundles all modules into a single export for routing on the server file (xample.js)
*/

// <<<code>>>

module.exports = {
    createlg: r_createlg.createlg,
    createpage: r_createpage.createpage,
    deletelg: r_deletelg.deletelg,
    deletepage: r_deletepage.deletepage,
    editpage: l_editpage.editpage,
    editlg: l_editlg.editlg,
    explore: l_explore.explore,
    getlgs: r_getlgs.getlgs,
    getpages: r_getpages.getpages,
    getprofiledata: r_getprofiledata.getprofiledata,
    getsubjects: r_getsubjects.getsubjects,
    home: l_home.home,
    journalerror: r_journalerror.journalerror,
    login: r_login.login,
    logout: r_logout.logout,
    notfound: l_notfound.notfound,
    page: l_page.page,
    profile: l_profile.profile,
    revertblocks: r_revertblocks.revertblocks,
    saveblocks: r_saveblocks.saveblocks,
    saveprofile: r_saveprofile.saveprofile,
    signup: r_signup.signup,
    start: l_start.start,
    uploadmedia: r_uploadmedia.uploadmedia
};

// <<<fold>>>
