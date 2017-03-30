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
var l_editguide = require('./loads/editguide.js');
var l_embed = require('./loads/embed.js');
var l_explore = require('./loads/explore.js');
var l_guide = require('./loads/guide.js');
var l_home = require('./loads/home.js');
var l_notfound = require('./loads/notfound.js');
var l_page = require('./loads/page.js');
var l_play = require('./loads/play.js');
var l_profile = require('./loads/profile.js');
var l_start = require('./loads/start.js');

/* route functions, for ajax requeset asking for data */
var r_createpage = require('./routes/createpage.js');
var r_deletepage = require('./routes/deletepage.js');
var r_deletetag = require('./routes/deletetag.js');
var r_getbmdata = require('./routes/getbmdata.js');
var r_getpages = require('./routes/getpages.js');
var r_getprofiledata = require('./routes/getprofiledata.js');
var r_getsubjects = require('./routes/getsubjects.js');
var r_gettags = require('./routes/gettags.js');
var r_journalerror = require('./routes/journalerror.js');
var r_login = require('./routes/login.js');
var r_logout = require('./routes/logout.js');
var r_revertblocks = require('./routes/revertblocks.js');
var r_saveblocks = require('./routes/saveblocks.js');
var r_savepagesettings = require('./routes/savepagesettings.js');
var r_saveprofile = require('./routes/saveprofile.js');
var r_setbookmark = require('./routes/setbookmark.js');
var r_setview = require('./routes/setview.js');
var r_signup = require('./routes/signup.js');
var r_suggesttag = require('./routes/suggesttag.js');
var r_uploadmedia = require('./routes/uploadmedia.js');
var r_uploadthumb = require('./routes/uploadthumb.js');

// <<<fold>>>

/*
	Section: Export Modules
	This section bundles all modules into a single export for routing on the server file (xample.js)
*/

// <<<code>>>

module.exports = {
    createpage: r_createpage.createpage,
    deletepage: r_deletepage.deletepage,
    deletetag: r_deletetag.deletetag,
    editpage: l_editpage.editpage,
    editguide: l_editguide.editguide,
    embed: l_embed.embed,
    explore: l_explore.explore,
    getbmdata: r_getbmdata.getbmdata,
    getpages: r_getpages.getpages,
    getprofiledata: r_getprofiledata.getprofiledata,
    getsubjects: r_getsubjects.getsubjects,
    gettags: r_gettags.gettags,
    guide: l_guide.guide,
    home: l_home.home,
    journalerror: r_journalerror.journalerror,
    login: r_login.login,
    logout: r_logout.logout,
    notfound: l_notfound.notfound,
    play: l_play.play,
    page: l_page.page,
    profile: l_profile.profile,
    revertblocks: r_revertblocks.revertblocks,
    saveblocks: r_saveblocks.saveblocks,
    savepagesettings: r_savepagesettings.savepagesettings,
    saveprofile: r_saveprofile.saveprofile,
    setbookmark: r_setbookmark.setbookmark,
    setview: r_setview.setview,
    signup: r_signup.signup,
    start: l_start.start,
    suggesttag: r_suggesttag.suggesttag,
    uploadmedia: r_uploadmedia.uploadmedia,
    uploadthumb: r_uploadthumb.uploadthumb
};

// <<<fold>>>
