/* eslint-env browser, es6 */
/******
	Title: Tutorial Page
	This is the front-end for explaining WisePool
******/

/* from google's recaptcha/api.js */
/*
    global grecaptcha:true
*/
/* from Bengine.js */
/*
	global extensibles:true
*/
/* from omni.js */
/*
	global autosaveTimer:true
	global createURL:true
	global emptyDiv:true
	global barPageSettings:true
	global btnLink:true
	global btnSubmit:true
	global barLog:true
	global barInfo:true
	global barMenu:true
	global barStatus:true
	global barSubMenu:true
	global formSignUp:true
	global getCookies:true
	global getSubjects:true
	global getUserFields:true
	global globalScope:true
	global journalError:true
	global setBookmark:true
	global setView:true
	global watermark:true
*/
/*
	global Bengine:true
	global alertify:true
    global CodeMirror:true
*/

var blockExtensibles = extensibles;
var blockCustomFunctions = {
    progressFinalize:function(msg,max) { /* */ },
    progressInitialize:function(msg,max) { /* */ },
    progressUpdate:function(msg,max) { /* */ }
};

function sendMessage() {
    event.preventDefault();

    var tf = document.getElementById('tutform');

    var review = tf['review'].value;
    var profession = tf['profession'].value;
    var email = tf['email'].value;
    var comment = tf['comment'].value;
    var captcha = tf['g-recaptcha-response'].value;

    if(review === "none" || profession === "none") {
        alertify.alert("Please select an option for the first two fields. Email & comment is optional.");
        grecaptcha.reset();
        return;
    }

    var paramArray = ["formid=tutorial","&review=",review,"&profession=",profession,"&email=",email,"&comment=",comment,"&g-recaptcha-response=",captcha];

    var params = paramArray.join("");

    var url = createURL('/message');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST",url,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if(xmlhttp.status === 200) {
                var result = JSON.parse(xmlhttp.responseText);

                switch(result.msg) {
                    case "sent":
                        alertify.log("Thank you, your message was sent!","success"); break;
                    case "fail":
                    default:
                        alertify.log("There was an ERROR sending your message!","error");
                }
            }
        }
    };

    xmlhttp.send(params);
}

function pageTutorial() {
    var main = document.getElementById('content');

    var tutorial = document.createElement('div');
    tutorial.setAttribute('class','wrapper');

    tutorial.appendChild(document.createElement('br'));
    main.appendChild(tutorial);

    /*** Explanation Engine ***/
    var explanation = document.createElement('div');
    explanation.setAttribute('id','explanationEngine');
    tutorial.appendChild(explanation);

    var expText = `With WisePool, you create content by adding "blocks". You're currently reading a text block. There are several you can choose from.<br><br>Try creating a "math" block below.<ol><li>Click the "math" button</li><li>Paste this into the empty bottom box that appeared: <b>sum_(i=1)^n i^3=((n(n+1))/2)^2</b></li><li>Click your mouse somewhere outside of the box</li></ol>`;

    var blockOptionsExpEngine = {
        enableSave:false
    };

    var explanationEngine = new Bengine(blockExtensibles,blockCustomFunctions,blockOptionsExpEngine);
    explanationEngine.blockContentShow('explanationEngine',['',0,0],['title','How To Use WisePool','xtext',expText]);

    /*** Example Engine ***/
    var example = document.createElement('div');
    example.setAttribute('id','exampleEngine');
    tutorial.appendChild(example);

    var exampleText = `sum_(i=1)^n i^3=((n(n+1))/2)^2`;

    var blockOptionsExampleEngine = {
        enableSave:false,
        blockLimit:2
    };

    var exampleEngine = new Bengine(blockExtensibles,blockCustomFunctions,blockOptionsExampleEngine);
    exampleEngine.blockEngineStart('exampleEngine',['page','wptemp','wptemp'],[]);

    var hr1 = document.createElement('hr');
    hr1.setAttribute('style','margin:30px 0px 40px 0px;');
    tutorial.appendChild(hr1);

    /*** Rules Engine ***/
    var share = document.createElement('div');
    share.setAttribute('id','shareEngine');
    tutorial.appendChild(share);

    var shareText = `When you finish your page, you can share it with a link or embed the blocks in your own web page. Embedding a page will look like the box below (click the left &amp; right arrow buttons to change blocks): `;

    var blockOptionsShaEngine = {
        enableSave:false
    };

    var shareEngine = new Bengine(blockExtensibles,blockCustomFunctions,blockOptionsShaEngine);
    shareEngine.blockContentShow('shareEngine',['',0,0],['title','Sharing Pages','xtext',shareText]);

    /** Embedded Blocks Example ***/
    var embedContainer = document.createElement('div');
    embedContainer.setAttribute('style','position:relative;height:0;overflow:hidden;padding-bottom:25%;margin-bottom:12px;'); // 56.25 = 9/16 (aspect ratio)

    var embedURL = createURL('/embed?a=tutorial');

    var embed = document.createElement('iframe');
    embed.setAttribute('frameborder','0');
    embed.setAttribute('allowfullscreen','true');
    embed.setAttribute('style','position:absolute;top:0;left:0;width:100%;height:100%;');
    embed.setAttribute('src',embedURL);
    embedContainer.appendChild(embed);
    tutorial.appendChild(embedContainer);

    var hr2 = document.createElement('hr');
    hr2.setAttribute('style','margin:42px 0px 38px 0px;');
    tutorial.appendChild(hr2);

    var tutForm = document.createElement('form');
    tutForm.setAttribute('id','tutform');
    tutForm.setAttribute('method','post');

    var formTitle = document.createElement('div');
    formTitle.setAttribute('style','display:inline-block;width:100%;height:auto;border:1px solid black;border-radius: 2px;padding:6px 6px;margin:0px;box-sizing:border-box;text-align:center;font-family:Arial,Helvetica, sans-serif;font-size:2em;font-weight:900;color:black;background-color:rgba(118, 118, 118, 0.15');
    formTitle.innerHTML = 'Survey Form';

    var reviewSelect = document.createElement('select');
    reviewSelect.setAttribute('name','review');

    var optionOne = document.createElement('option');
    optionOne.setAttribute('selected','true');
    optionOne.setAttribute('disabled','true');
    optionOne.setAttribute('value','none');
    optionOne.innerHTML = "What do you think about WisePool?";

    var optionTwo = document.createElement('option');
    optionTwo.innerHTML = "I want to use it right now.";

    var optionThree = document.createElement('option');
    optionThree.innerHTML = "I plan on using it in the future.";

    var optionFour = document.createElement('option');
    optionFour.innerHTML = "It's not for me, but I know someone who would use it.";

    var optionFive = document.createElement('option');
    optionFive.innerHTML = "I need to know more to make a decision.";

    var optionSix = document.createElement('option');
    optionSix.innerHTML = "It needs more features for me to use it.";

    var optionSeven = document.createElement('option');
    optionSeven.innerHTML = "It's not for me.";

    reviewSelect.appendChild(optionOne);
    reviewSelect.appendChild(optionTwo);
    reviewSelect.appendChild(optionThree);
    reviewSelect.appendChild(optionFour);
    reviewSelect.appendChild(optionFive);
    reviewSelect.appendChild(optionSix);
    reviewSelect.appendChild(optionSeven);

    var professionSelect = document.createElement('select');
    professionSelect.setAttribute('name','profession');

    var optionProfOne = document.createElement('option');
    optionProfOne.setAttribute('selected','true');
    optionProfOne.setAttribute('disabled','true');
    optionProfOne.setAttribute('value','none');
    optionProfOne.innerHTML = "Select Your Profession";

    var optionProfTwo = document.createElement('option');
    optionProfTwo.innerHTML = "Teacher/Professor";

    var optionProfThree = document.createElement('option');
    optionProfThree.innerHTML = "Student";

    var optionProfFour = document.createElement('option');
    optionProfFour.innerHTML = "School Administrator";

    var optionProfFive = document.createElement('option');
    optionProfFive.innerHTML = "Software Developer";

    var optionProfSix = document.createElement('option');
    optionProfSix.innerHTML = "EdTech Professional";

    var optionProfSeven = document.createElement('option');
    optionProfSeven.innerHTML = "Other";

    professionSelect.appendChild(optionProfOne);
    professionSelect.appendChild(optionProfTwo);
    professionSelect.appendChild(optionProfThree);
    professionSelect.appendChild(optionProfFour);
    professionSelect.appendChild(optionProfFive);
    professionSelect.appendChild(optionProfSix);
    professionSelect.appendChild(optionProfSeven);

    var emailInput = document.createElement('input');
    emailInput.setAttribute('type','email');
    emailInput.setAttribute('class','text-input');
    emailInput.setAttribute('name','email');
    emailInput.setAttribute('placeholder','Email');
    emailInput.setAttribute('style','text-align:left !important');

    var textareaComment = document.createElement('textarea');
    textareaComment.setAttribute('class','text-input-area');
    textareaComment.setAttribute('name','comment');
    textareaComment.setAttribute('placeholder','Request access or write your comments / suggestions here.');

    var captchaBtn = document.createElement('button');
    captchaBtn.setAttribute('class','g-recaptcha');
    captchaBtn.setAttribute('data-sitekey','6LdQNx0UAAAAAB2LmDsPXjnag5QQ1MooS7A8ae4r');
    captchaBtn.setAttribute('data-callback','sendMessage');
    captchaBtn.setAttribute('style','color:black;width:100%;padding:12px 18px;text-align:center;cursor:pointer;touch-action:manipulation;font-size: 1em;font-weight:400;');
    captchaBtn.innerHTML = "Submit";

    tutForm.appendChild(formTitle);
    tutForm.appendChild(reviewSelect);
    tutForm.appendChild(professionSelect);
    tutForm.appendChild(emailInput);
    tutForm.appendChild(textareaComment);
    tutForm.appendChild(captchaBtn);

    tutorial.appendChild(tutForm);
}
