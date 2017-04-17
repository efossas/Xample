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

    /*** Rules Engine ***/
    var rules = document.createElement('div');
    rules.setAttribute('id','rulesEngine');
    tutorial.appendChild(rules);

    var rulText = `WisePool is for creating short examples to help teach topics. <b>Learning by example is one of our core philosophies.</b> The embedded blocks above are a good example of the type of content to create. Please don't try to upload long lectures or abstract explanations<sup>*</sup>.<br><br><div style="text-align:right"><sub>Learning Guides are a feature coming soon for creating playlists of pages. That should help people looking to upload content for a full class.</sub></div>`;

    var treeText = `Pages are assigned a Subject, Category, &amp; Topic, as well as optional Tags. That makes it easier to find &amp; share pages with the community. The image below shows an example of a page hierarchy.`;

    var treeImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAz8AAAEPCAYAAABssHrHAAAD+HpUWHRteEdyYXBoTW9kZWwAAE1US9OqOBD9NVbNLMaCAAJLgSAoqCAKsrkFhPcjyBt+/Y3z3amaBaHTp3OSPun0jpHrJcmreAeosY+7Yxo3w45RdgCYeMurKtgBldtTBP7LDKK8GXCf7RiJzPVmiCvyJ24y3h5k8MhHU79o8Iv9m5jHtq1iNw4v+fBlYfg9c/gSXTTHNHZAJnaVl9+tT3FU4u8SOetwHX+j+T21B6LA72mGIcAjSIIu/x8NIM4p7vocNz/nPey5PfjxxygfcPfjnud5j7pg3uf4BxzWNv6BUozTb+Zgx8AdI6M8SLugJiFNUP8JuQdp/A/9E8L7jRQNeIZ6kGS1yS/d5Xp7vCEorxsurkOBPyKAH1hxmndMOqp6aqebfJGc28qaa6nZ04cuPwvJQXzW51OonKPpehVer0O+aXoaT7CeT/wpzMbbsaPQWvUiq3snWbX1gTNm+vPONzG1zRhn7zQLZ+uB88cSYGz7WQXpq8w+u2zMctq61ggJltW/bW4JgpHsaMO1df1wou8tA2EVbM5COWYvFgvrZM9XzWUjGxoaz59Hb5I6Y7lFbcGo4tnQ2hRST32kjVWgoH+qBh8RRolcirSqdH/dLkKBy5RdbpCNxoe2JdpREOtXr+ERVPbTCgAyVdut6pNy4kLb7ZjEyLzz0RbRwy1bpN1wHh4d0Rjdafo06PWg/E9M20+6Fs35Xi7SC1XP5mnht/+6tubjVOW6PnY5LNa7lNheYWWcbd0tw6JvbO9l6uejkZwFje07aDhyETTMaWqMMyk6tW1baTbUSG3hoUcr/ZSR8oGadxmgdY7Swj8iGqa3d91w4xaFt7CEatS8JGQ63/IzuqVZ82iSHUWf+Ey8ZGe+mSLuc0D6QbWcTUXCEAfAD4F/wB5IMHzQB2HMZW0VuWgULt4K8fJ2e+VkOOJEVJT0NhX4bhlqt06X/o278FoCG7Hb2AsQ3Km7GynlAgwl4nGcK0Q0TZkiQVO5e2SkrmYkh+noi4HekxJXQXZ0a0UWiMlmZxy4aSJOVZEos8ArLPFGUOHvae3JsmQCHPpwq1lGY1/u9KKm95kKx1a4YaKIQDgkC959rQDkaUtO6bNLSBgYd3wT2eoD8ho1a+aDp9QsIsA285jj38KDBsl4voxiVF+LxAHuBsn6iZ6WUXD0b0E6FrJuV0Hlwv4Sj8eyD2sOanmZUhc8lpnBSFZjgg5IRim36TLiF9OexLRRS4aoO6ltxKQ8eKMEx543RNl8CTNhKO4JB6AGDosH2BA4SX6xIj5cFSoaTXKCFHlBgoZZEDw99+XEjCg0IUr0DnTyGfmgaFbmLRLtyONnSH9S/+sJ/zYIMv/TLBn4Gy7U9GEAACAASURBVHhe7Z0HlBRF98UvmSXnJAioBBHJSEYEBEkKSI6SRCQJgopIVJAkIIqgxCVLVpIKkkURyTmjoCiSc57/eeU3+5+FBXZguqu76/Y53/lk6a6q93t32He7wsQA4AMvEiABEiABEiABEiABEiABEvA4gRhifnw++h+P55nhkQAJkAAJkAAJkAAJkIDRBGLEiAGaH6MlwOBJgARIgARIgARIgARIwAwCND9m5JlRkgAJkAAJkAAJkAAJkIDxBGh+jJcAAZAACZAACZAACZAACZCAGQRofszIM6MkARIgARIgARIgARIgAeMJ0PwYLwECIAESIAESIAESIAESIAEzCND8mJFnRkkCJEACJEACJEACJEACxhOg+TFeAgRAAiRAAiRAAiRAAiRAAmYQoPkxI8+MkgRIgARIgARIgARIgASMJ0DzY7wECMBEAqdOncKY8ZOwddt2JEiYCDu2bTERA2MOgkDuPPlw+dJF5M+XFy2bNUGKFMmDeNraW6lna/l6sXUn69mLvBkTCTiJAM2Pk7LBsZCADQRWrFqDAYM+Qa1mHZE6fUZkyprNhl7ZhRcIHD28HyeOH8WsccPRo/t7KF2yuPawqGftKXDtAJyoZ9fC5MBJwEUEaH5clCwOlQQelcCSZWvwzeLv0KpLv0dtis8bTuCrQd3x6iuVUeGFEtpIUM/a0HuuYyfo2XNQGRAJOJQAzY9DE8NhkUCoCcjSoPqNW/g+Hjs/RqjbZntmEni3eTXf7BmTYyRLlsx2ANSz7cg936FOPXseLgMkAQcRoPlxUDI4FBKwksDAIcOQPEteFCxe1spu2LZBBDasXYaLf+5Cl04dbI+aerYduec71Klnz8NlgCTgIAI0Pw5KBodCAlYSqN+4ua/uG91icI+PlZTNavuPQ/swe8xA39TwcbbPJlLPZmnNjmh16tmO+NgHCZDAfwRofqgEEjCEQPPWHXxte42wvUg1BK+xYY7s08E3/kv7dUU9Gys5SwP/om8H37jR9uvZ0qDYOAmQQCQCND8UBAkYQqBI8dL4YvZqQ6JlmHYReLNWaaxfZ7+uqGe7MmxWP7r0bBZlRksCegnQ/Ojlz95JwDYCLBZtQ21UR7qKRerZKJnZFqwuPdsWIDsiARLgsjdqgARMIcBi0ZRM2xunrmKRerY3z6b0pkvPpvBlnCTgBAKc+XFCFjgGErCBAItFGyAb2IWuYpF6NlBsNoSsS882hMYuSIAE/keA5odSIAFDCLBYNCTRNoepq1iknm1OtCHd6dKzIXgZJgk4ggDNjyPSwEGQgPUEWCxaz9jEHnQVi9SziWqzPmZderY+MvZAAiTgJ0DzQy2QgCEEWCwakmibw9RVLFLPNifakO506dkQvAyTBBxBgObHEWngIEjAegIsFq1nbGIPuopF6tlEtVkfsy49Wx8ZeyABEuDMDzVAAoYR8HqxePrkCfh8PiRKnBTx4sc3LLv6wtVVLHpdz/oyanbPuvRsNnVGTwL2EuDMj7282RsJaCPg1WLxwO7teP/Neji0b1cE255Dx6NandfUWf73u1Z+Nx9dWtTA9KVbkS1Xnki3/nFoP2qWyo53+n2OOq+1fai8XbxwHnu3b0K6jJnx2ONZH6oNpz+kq1h0i57/OnoELxfNipfrNccHg8cgZsyYESkdP6I/vhjYPUr9BeZddHTs94PImTs/RJcfdmmBL2evjNSW1Tq5efMm9u3cguy58uLWrVuoWTIbpi/bhiTJklvdta3t69KzrUGyMxIwnADNj+ECYPjmEHBLsRhMRqQga/FKcRw5sAfN2r+PZClSYcLnH+PP3w9h6MRvUfrFavdt7seFs/Fu69qY9sMWZH8mb6R7T/5zHCP6v4uylWqizEvVgxlWxL3+wrfrR5+hbrN2D9WG0x/SVSy6Rc9+E50wUWLMWbMPqdKkUym9cvkS6pXPo7Q6eclveDpPwXum+tiRg+jc7GV8vXwHjh4+gHdb11KafZC5D6V2bt64gaJZ4mLlnnOIH5YA235bh2cLFEWcuHFD2Y32tnTpWXvgHAAJGESA5segZDNUswm4pVgMJkv//HUMVQpnUibnkwnfqGJQjNDrrz6Pdu8PwEvVG2BEv3eQOt1jaNKmK25cv47PP34PSZKlQPMO3bFi8Vxlfmo3fROnTv6Df/78A6069ULJ8lVw9vRJTB49BM+VKo8ipcpD+vryk174dsZ4FC9bCa3f7oNn8hVWw5UCd+zwvmr26fEnsqNu8/Z4PGs2fPphVyycFY4UqdLgw8+nqna8dukqFt2iZ7/5kbz3HzUDFV6uqySw9bd1aPFKCfXfkxZvQK68hfDbTyvwYdeWyhC9WK0OOvcehtu3b6N9w4pKWw1avYWajd9Ax8aV0axdN3zUtRXSps+Iz6f/gKzZnlZtbV6/Br07vabaeLvPcNRp1g63bt5Un4PCJcpiaJ/OSJY8JTr1HoYNa3/El0N6qXve6jEEcePFU+ZK7l2xZJ7Sd9ePPkfOZwugb+dmWDxnijI8Q8bPx7ypX6FBq05IkDARdmz+Fd3b1ld9ivZf79xbzQjNnzYW/d55XY2r74jJqFSzoa2G7WE+a7r0/DBj5TMkQAIPR4Dm5+G48SkScB0BtxSLwYC9dvUqGlcqqArDslVexQsv1VCFWpancqoiy//3GTM/icHj5uH6tatoWuU5+P+8csk8ZX7kKlL6RaxfvVT994Rvf0bipMlQ6/mn1bK3yq82RsOK+VVxJ8uXxADJNWfNXiRMlAQv5U+v/ly+am0sWzgL8pZ/9OyV6NWhccRyvI9Hf60KWq9duopFt+hZzE+bOmXR4q0eWDJ3CkbPWoFYsWJhcI8OSJshk/pZjyHjkCbdY3ipQAb0+2I68hQshuljh+Pkib/Ra+gELF3wNcYM64uPR32t9rTJckzRmhj4hbMmYve2jWoZ3K6tv+G1qkUweOxcpM+UBe++Xguv1GuBhq93Vp+TSxfOo9+oGVg0Kxzzpo5By7d6oGiZiuj/zuto8uY7SufNqhVFvudKoX6rt5Q5Gj2oB2au3KWWvH3QtgG6DRiN/EVLo06ZXGrZ27kzp1CjZDb0GDIWeQoVV0tQy1etg4LFy6B7m3r4dMoSXLp4Xhk9GWPBYs87+iOgS8+OhsLBkYDHCND8eCyhDIcE7kXALcVisBmUt+VScMmBB/5LzIcUWlmz5cJr1Yogy5M5VVEpMz+Bf/bP/Mhb6cqvNsKq77/B282ro2nbd1XR6N/zI0Xq281eQdv3+qNR67fx0/LFaq+QGKOUqdIqA9VneDiq1G6CJXOnYkC3Nhg7by0SJk6i9nvIXo/qDVoGG5or7tdVLLpFz37zI6anRfUSarma6KJW6Zz4bNr3asZEzI/MGO7c8quanZElZovnTMai2ZOUWfr7zz/QpUV19azMzIiR+faXI0iaPAVkaaUYntmr9qhZzRSp0uKNrn2VdvwzSZOXbETL6iVUP88WLIojB/eibd3ymL/uoFq21v/d1ngyR2682qQNNv+yGk/nLaSWtu3ZtlEtt5O2ZYanbtncCF+8AXHixEWDF/NiwoJfsOqHbyB758RwyX6mPTs2K9OUKctTGPxBe4yY+h2eyJ5LjTtu/PhIlyGTo3WtS8+OhsLBkYDHCND8eCyhDIcETDM/Eq9swD5+7Hcc3LMdi+ZMxvJFc9RSuH5fzEDzV4o90PzMXLFTFWj+PTrybPsPBqH2/2Z+/AbnTradeg1Vxdy99g2F4tAEpytaV7HoJvPTskZJzF27HyM+6ooipV5UB2B81LWlmmFsUrkweg8Px1M5n0X4FwPVMjT/JTqUJWay50f2+Uz9frP6bzFCMusiM0iiMWlfDIosy/x6/GeRJCNLLsU0ta5VBmPnr0XylKnvOjThwy4tkSN3fnWwx/ffzED3N+tHtCHPS9vx4odFGJ7A/x7w/pvKsNVo2CpSv1evXFazW99MH6d+LsvhWnT8QC0BdfKlS89OZsKxkYDXCND8eC2jjIcE7kHALcViMAmU/T2yNE2W7HToPlA9Kkvd6pR9Bk9mfwYfjZyOFtWLI/1jmdWeoEsXL6jla7nyFFIzQf6ZHylC1Rtxf3ttuqJ6g1YRMz8pUqbBe2/UUTM4FavXV0t9/jl+DMlTpMaurRvwQbuG+GrOKhQoWlrtf1izdAGq1m6qjt6W2SPO/AST1ejd6xY9+83JNz8fwo5N69XsTPqMWdS+sko1Gyl9yHK240ePqAM2Rn39IzJkyoItG37CyI+7qRlMMTz+E94CjZDMtASaHzEismSuVtM31T6f82dP469jR5Azd4EI4yJ7ceQZv5mSNvzmp9jzFdUSNjFJufMXwYVzZ9RsT6D5uXPm5+sJn6m+/LNN8hnauWWD2isXJ04cNYN0cO9ODOreFi++XFfNnDr5ovlxcnY4NhIIDQGan9BwZCsk4HgCbikWgwF5/uwZNK5cKGKjtew5+HnFd+qQATngoHWXvhF7gmSJ2pZf1+KHb2aovTeB5kfeRssszvzpY7Fx3UqMmLJE7QvyL3srWa6KWr4mG8BlM/fyJXPVG+1+I6chY5an1D4i2Xjeuc9wfDmkp9rnI8XujevXlDmT/lp37YssT+YIJjxX3KurWHSLnv3mRGZ+8D8zLEs0F274Q5lnMepifn4/uBdjh/XFtKVbcfnSBbzVpApSpk6HQWPn4tiRA+jYpIqaKbp4/lwk4xJofpZ++zUmjR6s7pO9QR+/9wbOnzuDfiOno2GFfGqZ2v3Mz3Mlyym9inZTp82AcZ9+pA42kDHJUlI5nW7I2HlqiZ5/2duh/bvQsVElTFy4HukeexxvNa2K/M+VQpr0GdV+ppHTl6qldZ9/3E3NOtH8uOJjzUGSgKcJ0Px4Or0MjgT+n4BbisVgc3Z4/27IG28xLf5Llti06fohEiVJqg4xaFu/gvorWdomxuRO8xPYZ6tOPdGqcy/1tj3we35+WfUD2jWoGHFru24fo3Gbrmrp0azwLzDw/f//LqDPpn6HYmUq4sypf9VyI+nzrZ5DHF/4Bcte7qf5uT+1wD05YjxGfPSOmmGUAzhkb4/s3/no82lImjwlXq/1vDLycr3+dm989UlvdP1wBMpVra3MhhzlPnDMHHVAgf97fgLNVdy48TC4R3t1mIFccjLbsEkLERaW8K6Zn8DvCpLlaZmfzIHq9Vuq5XhyqptcYlTWrViixjZyxjK807ImNq9fjTmr9ypdi5mSg0GmfjUUw/t2+f8+wxdAjqF/s265iAM/5OXA+G9/RtoMGR9GZrY9o0vPtgXIjkiABNSBSPItgD5ZnsGLBEjAuwS8an78GTt35jRu3ryBePHiK9MTeMn+A/k3LixBwnsmWJbE+W7fjnhWNm43qlgg0pecyoEJF86fhRSZd/Yhz0s/0odsDg+8rl+7hpixYiF27NieE5iuYtGLepa9a7JUTU4QlGOnr165gthx4ijdyN/J8jL5+YMu+SzIJQciPMwlz8tsjehYNC/HbceLH181JVqOagzyRawysxX4uZAxyxJRuWTWx87vJXqYuOUZXXp+2PHyORIggeAJ0PwEz4xPkIArCXixWLQqEYFfQOnl/Tqh4KerWKSeQ5E9tnEnAV16ZiZIgATsI0DzYx9r9kQCWgmwWIw+flmy8+Oi2erNd/EXKqmlbbyiJqCrWKSeqUgrCOjSsxWxsE0SIIGoCdD8UBkkYAgBFouGJNrmMHUVi9SzzYk2pDtdejYEL8MkAUcQoPlxRBo4CBKwngCLResZm9iDrmKRejZRbdbHrEvP1kfGHkiABPwEaH6oBRIwhACLRUMSbXOYuopF6tnmRBvSnS49G4KXYZKAIwjQ/DgiDRwECVhPgMWi9YxN7EFXsUg9m6g262PWpWfrI2MPJEACnPmhBkjAMAIsFg1LuE3h6ioWqWebEmxYN7r0bBhmhksCWglw5kcrfnZOAvYRYLFoH2uTetJVLFLPJqnMvlh16dm+CNkTCZAAzQ81QAKGEGjeuoOvba8R8qXGvEggZARG9ungG/+l/bqinkOWQjYUQECXnpkEEiAB+wjQ/NjHmj2RgFYC9Rs399V9o1uMTFmzaR0HO/cOgT8O7cPsMQN9U8PH2W6qqWfv6MgpkejUs1MYcBwkYAIBmh8TsswYSQDAoKEjfMky5Y5RsERZ8iCBkBDYsPZHXD6+29e5YzvbzQ/1HJIUspEAAjr1zESQAAnYR4Dmxz7W7IkEtBI4ffoM6jZs6hsw7lvbC1WtgbNzywh0fa2Kb97s6TGSJkliWR/3aph6th255zvUqWfPw2WAJOAgAjQ/DkoGh0ICVhNYtWYdps9dhFZd+1ndFdv3OIGvBr2PRnVeRqniRbVFSj1rQ++5jp2gZ89BZUAk4FACND8OTQyHRQJWEVi95if07TcAtZp1RNrHHsfjT2S3qiu26zECsifixF9HMXPsUPTt3QMlNBofP1rq2WMiszEcJ+rZxvDZFQkYS4Dmx9jUM3CTCZw9exbjJkzGpi1bED8sIXZs22IyDsYeDQLP5s2PK5cvomD+fGjRvCl0LHW71zCp52gkkLdEIuBkPTNVJEAC1hKg+bGWL1snARJwIQH5h9Hn87lw5BwyCdxNgHqmKkiABEjg/wnQ/FANJEACJHAHARaLlISXCFDPXsomYyEBEnhUAjQ/j0qQz5MACXiOAItFz6XU6ICoZ6PTz+BJgASieMEpx976uMSD2iABEiCB/wiwWKQSvESAevZSNhkLCZDAoxLgzM+jEuTzJEACniPAYtFzKTU6IOrZ6PQzeBIgAc78UAMkQAIkcH8CLBapEC8RoJ69lE3GQgIk8KgEOPPzqAT5PAmQgOcIsFj0XEqNDoh6Njr9DJ4ESIAzP9QACZAACXDmhxowhwDNjzm5ZqQkQAIPJsCZnwcz4h0kQAKGEWCxaFjCPR4u9ezxBDM8EiCBoAjQ/ASFizeTAAmYQIDFoglZNifGGDFiyImucrIrLxIgARIwngDNj/ESIAASIIE7CdD8UBNeIkA9eymbjIUESOBRCdD8PCpBPk8CJOA5AiwWPZdSowOino1OP4MnARK4gwDNDyVBAiRAAlH8w8gvfqYsvEKA5scrmWQcJEACoSBA8xMKimyDBEjAUwRYLHoqncYHQz0bLwECIAESCCBA80M5kAAJkABnfqgBDxOg+fFwchkaCZBA0ARofoJGxgdIgAS8ToDFotczbFZ81LNZ+Wa0JEAC9ydA80OFkAAJkABnfqgBDxOg+fFwchkaCZBA0ARofoJGxgdIgAS8ToDFotczbFZ81LNZ+Wa0JEACnPmhBkiABEggKAIsFoPCxZsdToB6dniCODwSIAFbCXDmx1bc7IwESMANBFgsuiFLHGN0CVDP0SXF+0iABEwgQPNjQpYZIwmQQFAEWCwGhYs3O5wA9ezwBHF4JEACthKg+bEVNzsjARJwIoGlS5eiVq1aGDFiBJo2bQp/sRgeHo4OHTpg1qxZqFChghOHzjGRwF0EqGeKggRIgATuTYDmh+ogARIgAQDx48dH7NixERYWhpMnTyJVqlS4cuUKbty4gWvXrpERCbiKAPXsqnRxsCRAAjYSoPmxETa7IgEScC6BAQMGoFevXrh+/XrEIOPGjYvevXujW7duzh04R0YCURCgnikLEiABEoiaAM0PlUECJEAC/yMgsz5Xr16N4BEvXrxIfyYoEnATAerZTdniWEmABOwiQPNjF2n2QwIk4HgCgW/LOevj+HRxgA8gQD1TIiRAAiRwNwGaH6qCBEiABAII+N+Wc9aHsvACAerZC1lkDCRAAqEkQPMTSppsiwRIwPUE5G15z5490adPH+71cX02GQD1TA2QAAmQQGQCND9UBAmQAAkEEJDT3Vq2bIkxY8ZAlr7xIgE3E6Ce3Zw9jp0ESMAKAjQ/VlBlmyTgcAKnTp3C+K/GYuu2bUgcNw427T/k8BFzeLoJFMj2BC5cv4H8+fOhWcuWSJEiue4hRfRPPTsmFa4ZiJP17BqIHCgJuJQAzY9LE8dhk8DDEli1YgUGDBiMLgWyI1PSRMieIunDNsXnDCOw7/Q5/HHuIoZs3IsPPuiGkqVLaydAPWtPgWsH4EQ9uxYmB04CLiJA8+OiZHGoJPCoBFbNnYPFc+dgYOn8j9oUnzecwDurNqNa3Xoo9fLL2khQz9rQe65jJ+jZc1AZEAk4lADNj0MTw2GRQKgJyNKgRvUb+ZbUKhsj1G2zPTMJVJi5zDdz9tcxkiVLZjsA6tl25J7vUKeePQ+XAZKAgwjQ/DgoGRwKCVhJYNCAQShw7i+Uz/qYld2wbYMI/HDoGHamyoxOXTrbHjX1bDtyz3eoU8+eh8sAScBBBGh+HJQMDoUErCQgsz4982aJwT0+VlI2q+09p86i//Y/fJOmTbZ9NpF6NktrdkSrU892xMc+SIAE/iNA80MlkIAhBNo0aeobVTK37UWqIXiNDbPN2h2+UZPCbdcV9Wys5CwNvM1PO32jwifarmdLg2LjJEACkQjQ/FAQJGAIgSLFS2P9a9UMiZZh2kWgyMQFWL9utV3dRfRDPduO3IgOdenZCLgMkgQcQoDmxyGJ4DBIwGoCLBatJmxm+7qKRerZTL1ZHbUuPVsdF9snARL4fwI0P1QDCRhCgMWiIYm2OUxdxSL1bHOiDelOl54NwcswScARBGh+HJEGDoIErCfAYtF6xib2oKtYpJ5NVJv1MevSs/WRsQcSIAE/AZofaoEEDCHAYtGQRNscpq5ikXq2OdGGdKdLz4bgZZgk4AgCND+OSAMHQQLWE2CxaD1jE3vQVSxSzyaqzfqYdenZ+sjYAwmQAGd+qAESMIwAi0XDEm5TuLqKRerZpgQb1o0uPRuGmeGSgFYCnPnRip+dk4B9BFgs2sfapJ50FYvUs0kqsy9WXXq2L0L2RAIkQPNDDZCAIQS8WCxev3kTV27cQKwYMZEofjxDMumsMHUVi17Usz+zZy5dhg9AioQJnJVsA0ajS88GoGWIJOAYAjQ/jkkFB0IC1hLwUrF489YtDP9xLbrOWRQB7Z2KZdC3WgXEixP7viC3HTuOC1ev4bmsmRAnVixroRvQuq5i0Ut69stk8x9/otaXk3Ho5Gn1ozSJE2Hm643wfPYnIJrfcvQv5M2U4b66Dbzv1u3byNZjELb16ITk9zBSwd7vdUnr0rPXuTI+EnASAZofJ2WDYyEBCwl4qVh8Z84iDP5hlSoOO5Uvhcm/bMKu4/+gWp5cmPtGY8S+j6lpOWkWFmzbjUP93kPCeHEtJG5G07qKRS/pWZRy9cYNFOw3Ap3Ll0KdQnlw2+fDlPWb0W76fPw16AOkSpQQcd/shnPD+yJJWPx7iuvGrVsR9yWIGwfrDv6Ook88jrixo34pEOz9Xle1Lj17nSvjIwEnEaD5cVI2OBYSsJCAV4rFIydPI2v3AciYPCl+e78D0iZJjGs3bqLUkFHYcOQotvfsjJzpUmP8ut/Q45vvkTllcpTP+RTeKlcKK/YdRIcZ3+DEhYto/0IJfFyjEs5cvoxeC5Zi/E8bUCl3DvSpVgGFs2RSmfj18B/oMmcRpECU+38+9DvK5XwK1fPlxoWrV9Fv8XIM/H6lundAjUqqD5l5WrXvEL5asx6Vc+fA0GVr0Kx4Ifx08Ag6ly+t2v73wkW8PXsh8jyWHm+/WBryD7FbL13Folf07M/7gRMn1SyNGJ30SZOoH9++fRttp89Hx7Il0W/JckxZv0kZmSXtW+DkxUt4Z+5izNu8Q2nq83qvoMDjj6FZ+KyI++a3aap02KlcKWX0x679Fa9PmaPanty8HuoWzIPmk2ZHeb8sIxX91x87Tc1Eif57V3sRyROE3dVOw+fyu1rDgZ89XXp26+ef4yYBNxKg+XFj1jhmEngIAl4pFr/duhOvfBGOobWrqVkf/yVm5PrNW0gaFl8VZ22mzcOLT2dD1lQpVAFYr3BeFM6cEW/P/m+pnBSRs1s3QunBo1Vx17xEYWWA5NrbtyvixoqlTJZc0s7S3fvVf39evzpalyqCF4ePxcp9B9XfXb5+Q5mbFiUKY0zjWpizaTtqfzUlYmwTm9bBa+Ez0bXC8xj0ahUs2bEHlT8bj2ktGqD+c/keIpvOeURXsegVPfszKQa7UP8ROHzyNPq98hJKPJUFT6RKgWQJwtQta/YfRoNx0zC6YU1l5ksNGY1ST2VRhvvHPQfQ49vvsav329hy9HjEfaWzZUWu3p+oZW+7jp9AvbFTlXE6f/UqSgz6AivffgMxY8SI8v5Tly4rMza2cS0UfzIz6o2dhjoF86BM9iejbEeW5nnh0qVnL7BjDCTgFgI0P27JFMdJAo9IwCvF4uyN25SxEBPStkzxKKn8sGufmgWSN9IXrl1D+WFjUCTr45jXpgk6zVyAr3/biv0fvqPMixip/tVfUjMwi3fsQY1Rk1TbaRMnUv1MfK0OmhYrhJV7D+KFoV+qv6uYK7sqDGWfkcz4+Hw+1Bw9Wc0Mbe3RCWsPHFbPyptyWcYke4uKDPgcF69ew+4+XSJmmuTedEkTP2Jm9T6uq1j0ip4DsyczguN+2oBhy9ao2Um5ZMZlaO2q6gCE3H2GYkO39pDlbKv3H0ahzBnVf2/840+8PHIi9vTpog7+8N8XN3Ys5P1wOH55t626v92M+fiuQwvkSp8WB06cQvw4sZX+orr/m627MH/LTrWMNGbMmJD9SGKynkqTEu1nfHNXO5lSJNMrxBD1rkvPIRo+myEBEogGAZqfaEDiLSTgBQJeKRbvZX6OnzuPS9eu47FkSXHg35NoM3Wemo3xX/LWenrLBqpwm71puyoUpZgLnKHx3yuzStdu3kS3eUuw5YO31CZz/7IkMT+5M6RDmU9Gq1meliWfU4/JXiIpXH9+ty2OnTmn2vU/K38vBW3nWQuwuksb1W6mFEkxtXl9VVi6+dJVLHpFz/7cX75+XS2vTBr230yPnPi2fO9BdQDC7Z5nIAAAIABJREFU7NaNUeXZnBFGRg4vmLFhi1qS5r9k/5toOixunIj7Av9blmPKkk/RqN9UfVC5HJKExYvy/jenz0PZHE+hVakikeQp44yqnTRJErlZxhFj16VnT8BjECTgEgI0Py5JFIdJAo9KwCvFot+EyJIg2fMjhaBsFpeZFTnJ7eBH76LVlDnY8effWNaplTJDhfuPUG/Jxfy89b+Zn8P938Oi7XtQ56spysTUL5wPpy5dUsYldaJE2PD7UTQcNx3fvvkaquXNpdp7tu9QNfMj+36e7jUk0tK7ttPmYfL6TcrwbPrjT2V+5C19of/tH9p9/B+1BMl/+dt91Lzqfl5XsegVPfvzN+3XzeizcBl29uoc6cCO1lPmIHva1GhbppgyKaIpmRWSmce1Xd9EkayZcObyFTV7E2h+5L7AmZ9rN28hdqyYaqZo51//qL1EdQvljdRu4P2frViHm7dvoe/LFdUQ9/x9Qs2mls+ZDXFix7qrHZk59cKlS89eYMcYSMAtBGh+3JIpjpMEHpGAV4pFWWLWPHwWJv78mzrtrXvlspj52zY1yyP7esKb1kHZYWOw/8RJLGj7mlruI0di+2d+ZMP3zI3b8EWDGmopXPYeg9SG8d5VX8TczdvVm3HZiyOHJhTo9ykSx4+HN58vFnGwgZifxkUKoNjAkeqEuZH1q+P81WtqNqdUtqxY3ul1tVzoTvMjRwqX+eRLNU4Z945enZE6sfvflusqFr2iZ//H+s8z55DxvX74pFZVtHm+GOQMjF8PH8Xzn4zGsrdaoegTmZGn71DMa9NUmRox33JiYYakSfDR4h/VvjZZRil69d+XPW2qiFmdWZu2q4MNlnZspZ4XvYr+3ihdNMr7ZY9Qpc/GYf177fB4iuSo+vkElMqWBRmTJ4uyHZqfR/wHmo+TAAnYRoDmxzbU7IgE9BLwUrEop7t1m79ELSXzX+1eKK42issxwFPXb0Kj8TPUX72S9xl1MpYsi9vS4y215E3MkxSJv/fvhg2/H0PFT8dGtCMnwMnBBLFixsSKvQfw/vzv1Jty2TwuM0X+vUYykyMFof87WcRAyf4IKQ79S/MCl71JBxPX/YZm4TMjDkZw8ylvfmA0P6H7XMtetUAtSstirsWgyNHX1UeFKzO/r29XdJ2zWJkQucR4LNmxFykTJcCyji1R88vJ6r69fbqizNAv1Z4fmfkpN+wrZdjlktMSZYlmuiSJI9oNvF8OWpCTCrvMXqjulwNCFrRthpu3bkfZjujeC5cuPXuBHWMgAbcQoPlxS6Y4ThJ4RAJeMj9+FLIvQk5ak70NKe74Ekc5/U0Ktai+3PH6zZvw+RDxhajy57OXryJenFgRey5kg7fM0mSWt955nsay3ftR4dOxkZa6yZdIirGKgRhInTjhfY/7lXunb9iCxuNnqDf55Z7O9ogZdcbjuopFL+pZMipaFE2J+U4WFnbXl/aK8fd/ke/pS5fVqYRyyIE8JwYpfpw4ShiB9/mVIho8dfGy+uOdeo3qfrnv/JWr8MEX8bmQn92vHWeo8uFHoUvPDz9iPkkCJBAsAZqfYInxfhJwKQGvFotWpcP/fUKB7cts0cb3OyJb2lRBd1v3qylquZ3sVdrR621l2Lxw6SoWqWcvqMd5MejSs/NIcEQk4F0CND/ezS0jI4FIBFgsBi8IOXpYvrBUNpTHix1bzQDdOcMU3VaX7tqHfy5cVMvnZA+FVy5dxSL17BUFOSsOXXp2FgWOhgS8TYDmx9v5ZXQkEEGAxSLFYAUBXcUi9WxFNtmmLj2TPAmQgH0EaH7sY82eSEArARaLWvF7tnNdxSL17FlJaQ1Ml561Bs3OScAwAjQ/hiWc4ZpLgMWiubm3MnJdxSL1bGVWzW1bl57NJc7IScB+AjQ/9jNnjySghQCLRS3YPd+prmKReva8tLQEqEvPWoJlpyRgKAGaH0MTz7DNI8Bi0byc2xGxrmKRerYju+b1oUvP5pFmxCSgjwDNjz727JkEbCXAYtFW3MZ0pqtYpJ6NkZitgerSs61BsjMSMJwAzY/hAmD45hBo06Spb1TJ3DHMiZiR2kGgzdodvlGTwm3XFfVsR3bN60OXns0jzYhJQB8Bmh997NkzCdhKoFG9Br6e+Z6IkT1FUlv7ZWfeJbDn1Fn03/6Hb9K0ybabH+rZu7rSFZlOPeuKmf2SgIkEaH5MzDpjNpLA0IGDfHnOHo9RPmsGI+Nn0KEn8P2hP7ErdWZfp7c72W5+qOfQ59P0FnXq2XT2jJ8E7CRA82MnbfZFAhoJnD59Bg3q1vN9V7u87YWqxrDZtYUEXvx6qW/2vNkxkiZJYmEvUTdNPduO3PMd6tSz5+EyQBJwEAGaHwclg0MhAasJrF25Et+OHYNBpfNZ3RXb9ziBrqs2oUbrNiheurS2SKlnbeg917ET9Ow5qAyIBBxKgObHoYnhsEjAKgJrVq3Ghx/2Q5dCOfF40kTImTKZVV2xXY8RkD0Rf5y7hMEbdqFPn14oXrKE9gipZ+0pcO0AnKhn18LkwEnARQRoflyULA6VBEJF4OzZsxg/fgK2bNyEhLFjYdP+Q6Fqmu14lEDB7E/i4o2byF+wIJq3bA4dS93uhZZ69qjoLAzLyXq2MGw2TQIkAIDmhzIgARIggTsIyD+MPp+PXEjAEwSoZ0+kkUGQAAmEiADNT4hAshkSIAHvEGCx6J1cMpL/3nLSzFMJJEACJPAfAZofKoEESIAEOPNDDXiYAM2Ph5PL0EiABIImQPMTNDI+QAIk4HUCLBa9nmGz4qOezco3oyUBErg/AZofKoQESIAEOPNDDXiYAM2Ph5PL0EiABIImQPMTNDI+QAIk4HUCLBa9nmGz4qOezco3oyUBEuDMDzVAAiRAAkERYLEYFC7e7HAC1LPDE8ThkQAJ2EqAMz+24mZnJEACbiDAYtENWeIYo0uAeo4uKd5HAiRgAgGaHxOyzBhJgASCIsBiMShcvNnhBKhnhyeIwyMBErCVAM2PrbjZGQmQgBsIsFh0Q5Y4xugSoJ6jS4r3kQAJmECA5seELDNGEiCBoAiwWAwKF292OAHq2eEJ4vBIgARsJUDzYytudkYCJOAGAiwW3ZAljjG6BKjn6JLifSRAAiYQoPkxIcuMkQRIICgCLBaDwsWbHU6AenZ4gjg8EiABWwnQ/NiKm52RAAm4gQCLRTdkiWOMLgHqObqkeB8JkIAJBGh+TMgyYyQBEgiKAIvFoHDxZocToJ4dniAOjwRIwFYCND+24mZnJEACbiDAYtENWeIYo0uAeo4uKd5HAiRgAgGaHxOyzBhJgASCIsBiMShcvNnhBKhnhyeIwyMBErCVAM2PrbjZGQmQgBsIsFh0Q5Y4xugSoJ6jS4r3kQAJmECA5seELDNGEiCBoAiwWAwKF292OAHq2eEJ4vBIgARsJUDzYytudkYCJOAGAiwW3ZAljjG6BKjn6JLifSRAAiYQoPkxIcuMkQRIICgCLBaDwsWbHU6AenZ4gjg8EiABWwnQ/NiKm52RAAk4kcDSpUtRq1YtjBgxAk2bNoW/WAwPD0eHDh0wa9YsVKhQwYlD55hI4C4C1DNFQQIkQAL3JkDzQ3WQAAmQAID48eMjduzYCAsLw8mTJ5EqVSpcuXIFN27cwLVr18iIBFxFgHp2Vbo4WBIgARsJ0PzYCJtdkQAJOJfAgAED0KtXL1y/fj1ikHHjxkXv3r3RrVs35w6cIyOBKAhQz5QFCZAACURNgOaHyiABEiCB/xGQWZ+rV69G8IgXL16kPxMUCbiJAPXspmxxrCRAAnYRoPmxizT7IQEScDyBwLflnPVxfLo4wAcQoJ4pERIgARK4mwDND1VBAiRAAgEE/G/LOetDWXiBAPXshSwyBhIggVASoPkJJU22RQIk4HoC8ra8Z8+e6NOnD/f6uD6bDIB6pgZIgARIIDIBmh8qggRIgAQCCMjpbi1btsSYMWMgS994kYCbCVDPbs4ex04CJGAFAZofK6iyTRJwOIFTp05h7MSvsHXbdiRMFBvbNh9x+Ig5PN0E8uTPgksXbyJ/vnxo0bQVUqRIrntIEf1Tz45JhWsG4mQ9uwYiB0oCLiVA8+PSxHHYJPCwBFauXoEBgwaiSecMSJ8xHrJkT/iwTfE5wwgc2XcJx49ew8Shf6LH+91RqkRp7QSoZ+0pcO0AnKhn18LkwEnARQRoflyULA6VBB6VwA+rZ2DBktno/HGWR22KzxtO4JP3DqNG1QYoV/JVbSSoZ23oPdexE/TsOagMiAQcSoDmx6GJ4bBIINQEZGlQg6YNfaMX5o4R6rbZnpkEXq+0zTdr+swYyZIlsx0A9Ww7cs93qFPPnofLAEnAQQRofhyUDA6FBKwkMHDIQGTKvwfFyqW0shu2bRCBn5aexD87c+Ptt7rYHjX1bDtyz3eoU8+eh8sAScBBBGh+HJQMDoUErCTQoEkDX6sPksbgHh8rKZvV9uG9lzD+4/O+KROn2j6bSD2bpTU7otWpZzviYx8kQAL/EaD5oRJIwBACLds28nUfmc72ItUQvMaG2b/t374xI6fYrivq2VjJWRp4/7b/+MaMnGy7ni0Nio2TAAlEIkDzQ0GQgCEEihQvjRnrnjMkWoZpF4F6xX/F+nWr7eouoh/q2XbkRnSoS89GwGWQJOAQAjQ/DkkEh0ECVhNgsWg1YTPb11UsUs9m6s3qqHXp2eq42D4JkMD/E6D5oRpIwBACLBYNSbTNYeoqFqlnmxNtSHe69GwIXoZJAo4gQPPjiDRwECRgPQEWi9YzNrEHXcUi9Wyi2qyPWZeerY+MPZAACfgJ0PxQCyRgCAEWi4Yk2uYwdRWL1LPNiTakO116NgQvwyQBRxCg+XFEGjgIErCeAItF6xmb2IOuYpF6NlFt1sesS8/WR8YeSIAEOPNDDZCAYQRYLBqWcJvC1VUsUs82JdiwbnTp2TDMDJcEtBLgzI9W/OycBOwjwGLRPtYm9aSrWKSeTVKZfbHq0rN9EbInEiABmh9qgAQMIcBi0ZBE2xymrmKRerY50YZ0p0vPhuBlmCTgCAI0P45IAwdBAtYTMKlYPLz/DMplHx8l1Gr1cmDY1CqIGTP4L3Hv2fZHLJm9D8v2NEPS5PGtT5oLetBVLIZSzwPeWY2vBm+IRHvguAp49bXcSicHdp9C21oLsHhbE8SKFdOyrOzZ/i/SZ0wclLai0nrpilnQZ2Q5ZH4yGa5dvYmy2carsd9Lszdv3sauLSfwdN7UiBMnVqT4Ap8/ffIK3mvxPaavrBvU5ycwrtkTd+CfPy+ibfeilnF8lIZ16flRxsxnSYAEgiNA8xMcL95NAq4lEMpi0ekQjh05h86NFiPtY4mxaOZeNdyUaRKgaJlMyPREUnTpVzKo4s0f79djt2PHxn/w3uDSSJgortMx2DI+XcViKPX8XsvvET8sNlq+XUgxO7D7NJpXnqv+3G1waVy8cB37d55CgWIZLGXaouo8dOxVDHkKp4t2P37zM/eXBkieKgw3b9zG1FFbMHHEZvy4rzkyZU2KTev+Qr6i6RE3bmRj4+/kxo1byBF3OLaea4fESeJF6luMkf/5o4fOoUebZZi6vDakeIjuFRiXfDavXrmJp55OGd3Hbb1Pl55tDZKdkYDhBGh+DBcAwzeHQCiLRTdR69NhOcI/24yFmxsjV740auhHDpzBoPfW4Ls5+5Up6vN5WVSunQPXrt3EwHdW49lC6XD29FXMm7QThUtnRPseRZEsRRjmTd6FnZtPoFPf4sr8SOH5Wd+fcWDXKWTNnhxN2udHweKPuQnPI49VV7EYSj2L+Xkmfxo0bps/gofMhFTNP1kZCDFGi77ei+adCuLypRsY1vMnTBi+SWln9LyXI3K+YMYedKy/SLXRd2Q51G+dB7+sPIrD+87g1InL2LHxBL6c/wo2/vQnur72Hf4QMzH8BTRplw/hIzbjo84rVZuTl9VCzmdTY8OaY3fdd+fMk2iwTskZWL6/eYRx8fl86FBvEVKmCVNGfczg39TYEySMAzHw77++VI1x6ORKqFI3B95t/j3mT9mN/EXTq/GNHrgBJV/MjN7tfsQnkyth3Y9/qOdPHL+k+qrb8ll80X89ZIbpo9HlkTFLUqxcchgXz19D1bo5Vdv+P5/461KkuM6dvopzZ66hQvWn8O/flyCfz8Wz9inDN3B8ReTInQrHj13AuKEbVU7ebrJEMZm+so4yTGJE78X/kcUMQJeeQzF2tkECJBA9AjQ/0ePEu0jA9QRCWSy6CYbf/Mzf0BB5CqVTBVeR9KNVCLVeewYrFh9Whemn06uoguzlglOwf9cpJEocF/HCYqu/K1zqMUxdXgcfvLEUPy44pJa9Xb92K6KdyrWzqwJOnpFiOXW6hG5C9Ehj1VUshlLPUZkfWe4lWhg88SUkSBRHmYkFmxphzJDfsHPTCWUqZEZEzM6GE22w8ae/8EaNbzBtRR3IpEj9MjMxY1VdpZ+2tRfgpVezoVnHAogbLxZqFJmGUXNfRsYsSdRyujotnkWlWtnQqdESvNo0F15u8DSO7D8T5X1vvl8kUr785ufOpZiyPHPiiE2YsKQmXsw5US17E113rLcI45fUVEaldokZylTI0r63GizGh6PL47nSj+HVotPVvR+OKo8XqmRF7eIz1POy7E2WkzZ6Mx8avZkXEz/dpIzRdzua4vu5B/DPXxfxetfCanzfTN2t/vziK09Gimvl4sPq503b51fxFSr5GFq/WxhLZu3DiD4/q8+PGBzp54UqT6Bj72KY8dU2HNxzWi23k+WJUfFPmTrBI+nY/7AuPYdk8GyEBEggWgRofqKFiTeRgPsJhLJYdBONO82PFIVSjH4x52W8VDMbTv17Ga8WnYa0jyXC+MU1VUF4+eJ1fPNbI8RPEBuNy83Cnm0nsXRPM4we8CsWfr1XmR8p+qSdIeEvoWaTZ1SxJ0uCZq6th5x5UrsJ0SONVVexGEo939f8hL+ExEnjKZMis4cfvrUCly5cR5f+JZEmfSLs3noC6TMlRo82P6rZEpkVkWv+lF1Ikjw+rl25ieG91mHR1iaIHTsmurdeilRpE6BT3xLqvp9X/IFuLX/A9ztfwzvNvsPr7xTGM/nT3ve+ePFjR+TsXuZn8ay9mPLFVoxbVEPNYMmyuF9XH0Pvdssx4buayJYrJY4cOIt48WMps/5S7nDICwJZGiemT4zPc6Uzqj1DlfNOUs+L+Wn20hz1WZC9QTIL9vwTY1Ufh/eeUS8W/EsH5fPg/3PH+gsj4vL/vGSFzGhReR5+3NcM8cPiQGarmlWai2r1c6JA8Qx4peAUrDjYAmJqZKZWPpfyuROWd/LP8HiSoPZJ3U/wuvT8SB9CPkwCJBAUAZqfoHDxZhJwL4FQFotuonCn+Rk14FcM7rYGi7Y0xtN506jiToo9KezkZ43Lz1ZvnN8bVFqF+Wmfdfi098+Y83N9fDttz13mx9+Om5iEcqy6isVQ6jkq8yOFfeU84RgxoyoSJ/t/8/Pn7+fRuvo32LPtX4VRlq3VaJIL1QtNUbM5oqnAy29CpvxYW82w+PUYeI8s65LC/oM3lqFVl0JqCdj97gs8uOBe5kdMxrQvt6qZn2oFpijzIrNO0u7McTtU9zL70vaDokicJG6EwZElfhWfmYgRX1dVM6V3mp/AAw8iZsfCX7rL/Hw7fQ9O/HVRmaH2dRdGxOU3P2K45EWCLLPzHz4ixjB77lQo/VKWCLMpfxcY4/mz1+7i37BN3nvuZwpW67r0HOw4eT8JkMDDE6D5eXh2fJIEXEUglMWimwK/0/x8M203OjVcrMxM/qIZIsyPbOye+0t91C8zC49lTqL2csj+CimMF8/chyU7mmLskN8izI/saZB2ZGmTvCHf+utxtSSuZtNcyPJUcjcheqSx6ioWQ6lnyXG+IulRr1WeCBY/LfsdbWp+G7EMyz/zI+YndboEuHb1Fjb/clwdjDBnXX306bgC7wwoheJlH1dtrF36uzIbJ/+5pGZg/OZHZkHyF8uglo7dunlb7S2TQwBkr1igSbjffYEJi2rPj2i5QZmvUabyE2jRuWCEsZGlmrFix0RYgtjqAAc5vbBq3Rxo3Dafusc/83M/8/NG9W+wZHtTZVjE/PjvPbL/LI4eOhtxipssT5N77mV+5GS5vh1XRJyg59+n9HylLChY4rH7mp87+c//tWFQh0TcT/C69PxIH0I+TAIkEBQBmp+gcPFmEnAvgVAWi26icKf52bvjJCo9Gx5x0IHsQZg9cac6AU4KRdmHIG/15ZADWV40pPtadZiB7Gv48K2VEUdd/37gLKo/N1UdTdxjeBkM67lO7ZNYdailOmHLlEtXsRhKPYv5iRsvNpp3KoBbN33Yu/1ftKuzUGlC9tiIwRDzI3t+WlSZhzKVs+K1DgVw5fINvFpsOgaMrYB1y//ArPE7MG99A2Voyjw5Tu2nkT0/cuCG/3joqaO3YszgDZj9cwMkThoXPd5YhnNnrmL0vFfwVoNFKP/KU8qQTPty2z3vCzxpzX/amyy3TJEqTI3pq0EbsG75UTWTKbNE/mVrsi9NluNNWlpLzZTIDGiK1AnQ4I28apZLxiBav5/5kb04smS0Yo2n1AzSqI/XR+z5kYMI5q5viNP/XkaFXBPR78sXUf/1PBAj549LZk9lOdwrDZ9We+bGfFsd5ao9qQ6GaPDCTKz5vZXaT+c3m4EzP0t3v6b2JkXFP5gT8mh+TPnXiXGSQNQEaH6oDBIwhEAoi0U3IfN/h8virU0i9uL8MP+A2pzuv+S0rW6Dn1d/9Jsf/98Fnr4lbS2YvifiO1OmfLFFvT33XxO/e1WdgGXS5QXzc+cSMzm4QgxtzabPqNk/MRj+5V7bNvyNmkWnRaS4Sp0cat/X7ds+ZZhWLDqk/k42/su+oKXzDyjDMWruf8u75ETBPu2XY8aY7eo+OWFt7MIaSJ4yDOOHbVQno8msZK78ae55X6C+ovqeHzmAQ/YUPZkzRaRla2IqGpWbpUy6XGLcZ/9cX+35kaV8G1Yfw7K9zdTSz+HTKkcsCw3c8xP4/VnCadrKOshdIK0ycE0rzoHwkZ+nSB2mXibICXqBcR09fD5iOdzyhQfRstr8iHBk2WDFGtki8Q40P3Ki3cHdp6PkH7gP6lE+f7r0/Chj5rMkQALBEaD5CY4X7yYB1xIw1fzcK2Hyhlw2TseOE1MdYy2XLOMR85MtVwr1RagXzl1DwsRx1Ub1e11yMtXVyzcQljCOkd/9o6tY1KlnMTAXzl5TS8jEtAReYgJEUw/6Hqizp6+ox/za87chbceL9/8HGtzrvof9h+jWrds4c+qqejxl6rBI39dzZ9/36kPakM+GaD5wrP6fJ0oS767PzL3als+h7ONJlCTuA5kFMroX/4fl4n9Ol54fddx8ngRIIPoEaH6iz4p3koCrCegsFt0Czr/JXU5+kyOL7/xOFbfEYec4dRWL1LOdWTanL116NocwIyUB/QRofvTngCMgAVsIsFh8MGbZKC4b1eUtdKESZn1Z6YPpRH2HrmKRen7YjPG5+xHQpWdmhQRIwD4CND/2sWZPJKCVAItFrfg927muYpF69qyktAamS89ag2bnJGAYAZofwxLOcM0lwGLR3NxbGbmuYpF6tjKr5ratS8/mEmfkJGA/AZof+5mzRxLQQoDFohbsnu9UV7FIPXteWloC1KVnLcGyUxIwlADNj6GJZ9jmEWCxaF7O7YhYV7FIPduRXfP60KVn80gzYhLQR4DmRx979kwCthJgsWgrbmM601UsUs/GSMzWQHXp2dYg2RkJGE6A5sdwATB8cwiwWDQn13ZGqqtYpJ7tzLI5fenSszmEGSkJ6CdA86M/BxwBCdhCoFXbRr73R6aLYUtn7MQYAv3a/u0bO3KK7bqino2RmK2B6tKzrUGyMxIwnADNj+ECYPjmEGjQpL6v1QfJYmTJntCcoBmppQQO772E8R+f902ZONV280M9W5paIxvXqWcjgTNoEtBEgOZHE3h2SwJ2ExgybIAvQ569MYqVS2l31+zPowTWLT2Ff3Y96+vcsbPt5od69qioNIalU88aw2bXJGAcAZof41LOgE0lcPr0GdRrVNf35eI8theqpjL3etwtK271zZ01J0bSJElsD5V6th255zvUqWfPw2WAJOAgAjQ/DkoGh0ICVhNY/dMKzFowEp0HZLG6K7bvcQKfvHsY9ap3RMlipbVFSj1rQ++5jp2gZ89BZUAk4FACND8OTQyHRQJWEVi9dhU+7NcPTTtnQIbHw5A1B/cAWcXaa+3Knoi//riKCUOOoW/vXihRrKT2EKln7Slw7QCcqGfXwuTAScBFBGh+XJQsDpUEQkXg7NmzGDdxAjZv2YiwhDGxbfORUDXNdjxKIG+BzLh80YcC+QuhRbPm0LHU7V5oqWePis7CsJysZwvDZtMkQAIAaH4oAxIgARK4g4D8w+jz+ciFBDxBgHr2RBoZBAmQQIgI0PyECCSbIQES8A4BFoveySUj+e8tJ808lUACJEAC/xGg+aESSIAESIAzP9SAhwnQ/Hg4uQyNBEggaAI0P0Ej4wMkQAJeJ8Bi0esZNis+6tmsfDNaEiCB+xOg+aFCSIAESIAzP9SAhwnQ/Hg4uQyNBEggaAI0P0Ej4wMkQAJeJ8Bi0esZNis+6tmsfDNaEiABzvxQAyRAAiQQFAEWi0Hh4s0OJ0A9OzxBHB4JkICtBDjzYytudkYCJOAGAiwW3ZAljjG6BKjn6JLifSRAAiYQoPkxIcuMkQRIICgCLBaDwsWbHU6AenZ4gjg8EiABWwnQ/NiKm52RAAm4gQCLRTdkiWOMLgHqObqkeB8JkIAJBGh+TMgyYyQBEgiKAIvFoHDxZocToJ4dniAOjwRIwFYCND+24mZnJEACbiDAYtENWeIYo0uAeo4uKd5HAiRgAgGaHxOyzBhJgASCIsBiMShcvNnhBKhnhyeIwyNWzXVQAAATbklEQVQBErCVAM2PrbjZGQmQgBsIsFh0Q5Y4xugSoJ6jS4r3kQAJmECA5seELDNGEiCBoAiwWAwKF292OAHq2eEJ4vBIgARsJUDzYytudkYCJOAGAiwW3ZAljjG6BKjn6JLifSRAAiYQoPkxIcuMkQRIICgCLBaDwsWbHU6AenZ4gjg8EiABWwnQ/NiKm52RAAm4gQCLRTdkiWOMLgHqObqkeB8JkIAJBGh+TMgyYyQBEgiKAIvFoHDxZocToJ4dniAOjwRIwFYCND+24mZnJEACbiDAYtENWeIYo0uAeo4uKd5HAiRgAgGaHxOyzBhJgASCIsBiMShcvNnhBKhnhyeIwyMBErCVAM2PrbjZGQmQgBMJLF26FLVq1cKIESPQtGlT+IvF8PBwdOjQAbNmzUKFChWcOHSOiQTuIkA9UxQkQAIkcG8CND9UBwmQAAkAiB8/PmLHjo2wsDCcPHkSqVKlwpUrV3Djxg1cu3aNjEjAVQSoZ1eli4MlARKwkQDNj42w2RUJkIBzCQwYMAC9evXC9evXIwYZN25c9O7dG926dXPuwDkyEoiCAPVMWZAACZBA1ARofqgMEiABEvgfAZn1uXr1agSPePHiRfozQZGAmwhQz27KFsdKAiRgFwGaH7tIsx8SIAHHEwh8W85ZH8eniwN8AAHqmRIhARIggbsJ0PxQFSRAAiQQQMD/tpyzPpSFFwhQz17IImMgARIIJQGan1DSZFskQAKuJyBvy3v27Ik+ffpwr4/rs8kAqGdqgARIgAQiE6D5oSJIgARIIICAnO7WsmVLjBkzBrL0jRcJuJkA9ezm7HHsJEACVhCg+bGCKtskAYcT+Pvvv9GvXz+sXbsWyZIlw8qVKx0+Yg5PN4EyZcrg7NmzKF26NLp37440adLoHlJE/9SzY1LhmoE4Wc+ugciBkoBLCdD8uDRxHDYJPCyB+fPno02bNuoLPbNly4Z8+fI9bFN8zjACW7Zswb59+9C+fXuMGzcOVatW1U6AetaeAtcOwIl6di1MDpwEXESA5sdFyeJQSeBRCUihOGnSJMydO/dRm+LzhhOoUaMGmjdvjmrVqmkjQT1rQ++5jp2gZ89BZUAk4FACND8OTQyHRQKhJiBLg/Lnz4/jx4+Humm2ZyiB1KlTY/fu3UiVKpXtBKhn25F7vkOdevY8XAZIAg4iQPPjoGRwKCRgJYF27drh+eefR+3ata3shm0bRGD69On49ddfMWzYMNujpp5tR+75DnXq2fNwGSAJOIgAzY+DksGhkICVBGTWZ8KECdzjYyVkw9retGkTWrVqhY0bN9oeOfVsO3LPd6hTz56HywBJwEEEaH4clAwOhQSsJFCmTBnfypUrY1jZB9s2j4AuXenq17wMmxUxdWVWvhmtmQRofszMO6M2kIB82H0+n4GRM2QrCejSla5+rWTJtvUToK7054AjIAGrCdD8WE2Y7ZOAQwjwl7pDEuGxYejSla5+PZY+hnMHAeqKkiAB7xOg+fF+jhkhCSgC/KVOIVhBQJeudPVrBUO26RwC1JVzcsGRkIBVBGh+rCLLdknAYQT4S91hCfHIcHTpSle/Hkkbw7gHAeqK0iAB7xOg+fF+jhkhCXDmhxqwjICuYlFXv5aBZMOOIEBdOSINHAQJWEqA5sdSvGycBJxDgL/UnZMLL41El6509eul3DGWuwlQV1QFCXifAM2P93PMCEmAMz/UgGUEdBWLuvq1DCQbdgQB6soRaeAgSMBSAjQ/luJl4yTgHAL8pe6cXHhpJLp0patfL+WOsXDmhxogARMJ0PyYmHXGbCQBFotGpt3yoHXpSle/lgNlB1oJUFda8bNzErCFAM2PLZjZCQnoJ8Bf6sDVq1dRpEgRbNu27a6EZMyYUf08efLk+pPlohHo0lWo+xVtlC5dGhs2bIhEf/LkyWjYsCGuXbuGbNmyWa4RGUd0+pk9ezbmzJmDqVOnImbMmBFj3r9/P7Jnzx4phooVK2LkyJF48skn1WfgQe3fvHkTW7ZsQd68eREnTpxIbQU+f/LkSbRo0QIrV66MNIYHyXf79u2Qz5t81iZOnIg///wT3bt3f9Bjtvx9qHVly6DZCQmQQFAEaH6CwsWbScC9BPhL/T/z07RpU5VEKdhOnDiBxIkTo1KlSrhy5YoqJOXPvKJPQJeuQt3vpUuX8Nxzz2HAgAEoUKAAxACIGX755Zfx888/o1ChQli3bh2KFi2KuHHjRh9QkHdKv9HpZ9asWfjss8+wYsUKxIoV6y7z88svvyBVqlS4ceMGRo0ahREjRmDfvn3ImjXrA9uXZyTGc+fOIUmSJJEiCBzfoUOH0KZNGyxfvlx9j1h0r6pVq6JXr14oXLgwjhw5oj57Tz/9dHQft/S+UOvK0sGycRIggYciQPPzUNj4EAm4jwB/qUfO2dy5c/Hqq6+qN+Jvvvmm+svdu3ejR48e+OGHH1CmTBlV2IkxkuvXX39Fly5dVDHZvn17VRCXK1cO1atXd58YQjhiXboKdb9ijJ955hl8++236v/lun37NvLnz4+BAwfihRdewKBBg9CpUyecPXsWQ4cOVX/XpEkTpEmTRplpfwHv15a0MXz4cLRt2xa3bt3CO++8g7Jly6Jz585ImTIlhg0bhh9//FEZgXbt2mHIkCGqX38/iRIlUuamZcuWEKNRp04d9UyGDBkg5ueLL75Qz98581OyZEnIDJDfuPh8PtSrV0+Nc/Dgwep/EkfChAkxduxYvP7666pfmeWqW7cumjdvjilTpiijN3/+fBX/iy++qMYo90if8vzx48chfcn4+vfvD5lhGj16NLJkyYIlS5bg/Pnzqj25/H/+66+/VPwylmXLluH06dM4c+aM+hz9/fff6NChg4pNjNH48eORO3duHDt27L68Qyhnfhl0KGGyLRJwKAGaH4cmhsMigVATCHWxGOrx2d2eLBuqXbs2Pv/8c1WcSqEmy4FkNkgKMDE78vZclv8kTZpUvTGXS4rApUuXqv/2P2v32J3Uny5dhbpfMT8FCxZURf2zzz6rZn4kzzJrsnXrViRLlixiuZgs95KlZVWqVEHv3r3x1VdfYc+ePcoALVy4EK+88ooyLalTp1YzR82aNVPGWdoXnc2YMQPh4eEYM2aMMttiGsSAiDkSs+BfliZjEqMzffp0FCtWTBkpMQjTpk2D6Pd+5kfGE7iEU+6X2R8xITlz5lSzWrt27VKmyG9MSpQoEbGErUGDBsrIyFJAMUFyr7CQmIsXL66e93OQlwfyv08//VQZox07dkAMoBidrl27KrnKrKr8Wdg0atRIzcBKH4sXL1Y/lxcKsiRVzNS7776rDFCfPn3UbNWFCxfuyTvQ+IXicxFqXYViTGyDBEggtARofkLLk62RgGMJ8Jd65NTcaX6kkJs5cyZSpEihCjwpFD/44AO1B0SW5ohRkv0JUrRJkSszATQ/0PamPNR69pufo0ePKvMh16ZNm9QyyFWrVqlZHdkDI4ZYtCJG5uDBg8rgHDhwAGIcZOZQZgvF8Mg+Iblkf0vlypVVWzKbOG7cOGUm9u7di/Lly6s2ZIlZ69at1SxHq1atIvqR5WxiwmW2SGYcZdZl0qRJyliJuQjG/PhnihYtWqRmrCSO1atXq9mc7777Drly5VJxxI8fH+nSpVNjEe3L2CRWMT5ihIRTIIeXXnpJGT/ZGyRLB5944glIHxKfGLW33347wvz4/1y/fn1l9GQcYork5xUqVFCcxOyEhYVBZqtk1lXuFbMVFe87DV4o/vENta5CMSa2QQIkEFoCND+h5cnWSMCxBPhL/f7mR970y34PeRMfeEkBKMtzunXrFrEJXIpEKZBpfrxlfmS5mxwikC9fPiUBKcBlSZrM/slsjd80iPmpVasWNm/erJacyRIzmbHYuHEjnn/+eWVMxCDI5f87aUPMz9q1a5Vhkp8HHhYgS8ekffmZ31wkSJBALTmTMfivatWqqaVoMs5gzI+YjC+//FLN8sieJjE/8eLFU7OcYsjkktkXMfyyXM4/BjEiwuXrr79W+57uND+BMfgNpMxq3Wl+ZPZKZnjEDMnslsyEydI2v/kRwyV9SGz+2Ry/IRSDFRVvmh/H/rrhwEjA0QRofhydHg6OBEJHgObn/uZH3rDLspuPP/5YLX2SokwKOzE/8jZa3uTLfhApPmVZjyyNovnxtvkRxYiRkeVmgabhXuZHdCGzhp988glKlSqlBLdz505I8S4zP2KQxHTIcjQxP4EFfVTmR5aQyRIw+X/ZR/PTTz8pEy4zjw8yP4F7fsTYi/GSmRXZb+M3NnKCXezYsSEmS8Ypyz/FmMj/yz3+mZ/7mR/ZqyOzW2JY/PumxMRI/7JPyX+Km+wzknvuZX6kv44dO6rldDLj5d+nJLM/MqtG8xO63wVsiQRMJ0DzY7oCGL8xBGh+7m9+ZHZH9vPIxm05yECW20jxJm/sZeO7vC2XJVCyt0HexstF8+Mt8yNLq2TmT2ZgpPiWJXCyHKtfv36RTMO9zI/MRMgJbGKUZCmZLAUTMyQzHH379o0wHdE1P7IfRp6TPUey70XakhkSMWTz5s1Tfd15zLT/qGuZYZLT3i5fvqwOUJAT2UTL0rff/MhSODnYQPY2yfI2MVYyK/XGG28gT548qg/Z23Q/8yN/L0asRo0aagZJXh749/z07NkT69evx7///quW1cnMk+xtks+W7P0RoyX7l2TZm7xcSJ8+fcQLBv/S0t9//10dM07zY8yvKgZKApYToPmxHDE7IAFnEKD5iZwHWV4jBZss0ZETu+TEKXk77v8OIFkCJMWl7LOQDdqyz+L9999Xb8hl74Psa6D58Zb5iep7fmTWR/bFyJ6bwL0ugcu9/Evb5P/l8h8iIP8t+3vEDMleGv/zfvMT2IYsP8uRI0ekZW+yh0aW0YkJl0sOV5D/yX40MQpiXMQIPeh7fmS/mpgoOeggcNmamAox+nKYgVzy3TtyiqEYLJnRkT1B/r1JYlJk/Hcuewv8TiF5OSCmRV4UyOdJDnKQ2SP5uZgqmXWSWSU5sU7+W/o6fPhwxHI4OSxCZlb9l8Qmn9E7lwgG8r7zKO5H/deW/04+KkE+TwLOJ0Dz4/wccYQkEBIC/KUePYxy9K4cASz7IfyX7O2QJUeZM2eGfEeJzBLJjIAcdyxL5Ey+dOlKV7/RzbWcGiizR2nTpo3uI1HeJ0dkiyalyBdNynfiyIySLFcLxSXtnzp1SjUlBiXw+3rEHAV+Du7Vn7Qh3wl05+fG/3MZ+53jvVfbMlMlR4nLM3LUt92X03VlNw/2RwJeJEDz48WsMiYSiIIAf6k/vCzktDf/Udf+VuRttmxw958M9vCtu/tJXbrS1a+7s8XRP4gAdfUgQvx7EnA/AZof9+eQEZBAtAjwl3q0MN3zJtm3IEcey3IeeRsuM0ByLLbply5d6erX9Hx7PX7qyusZZnwk8N9y7Rj/nejpIw8SIAEPE+AvdQ8nV2NounSlq1+NqNm1DQSoKxsgswsS0EyA5kdzAtg9CdhFgL/U7SJtVj+6dKWrX7Oya1601JV5OWfE5hGg+TEv54zYUAL8pW5o4i0OW5eudPVrMU42r5kAdaU5AeyeBGwgQPNjA2R2QQJOIMBf6k7IgvfGoEtXuvr1XgYZUSAB6op6IAHvE6D58X6OGSEJKAL8pU4hWEFAl6509WsFQ7bpHALUlXNywZGQgFUEaH6sIst2ScBhBPhL3WEJ8chwdOlKV78eSRvDuAcB6orSIAHvE6D58X6OGSEJKAJlypTxrVy5Uk535EUCISOgS1e6+g0ZODbkSALUlSPTwkGRQEgJ0PyEFCcbIwHnEsifPz8mTJiAfPnyOXeQHJmrCGzatAmtWrVSX/Zq90U9203c+/3p1LP36TJCEnAOAZof5+SCIyEBSwl07NjRV6JEiRh16tSxtB82bg6BGTNm4JdffvENHz7c9hlF6tkcndkVqU492xUj+yEBEuCXnFIDJGAMgRMnTuDZZ5/FP//8Y0zMDNRaAilTpsT+/fuRIkUKazuKonXq2Xbknu9Qp549D5cBkoCDCHDmx0HJ4FBIwGoCCxcuxLhx4zBv3jyru2L7HidQvXp1tG7dGpUqVdIWKfWsDb3nOnaCnj0HlQGRgEMJ0Pw4NDEcFglYRWDBggVo3rw5RowYgRw5cqBAgQJWdcV2PUZA9kTs27cPbdu2xZQpU7QaHz9a6tljIrMxHCfq2cbw2RUJGEuA5sfY1DNwkwmcPHkSH330EdasWYMkSZJg5cqVJuNg7NEgUKZMGZw/fx6lS5dGjx49tCx1u9cwqedoJJC3RCLgZD0zVSRAAtYSoPmxli9bJwESIAESIAESIAESIAEScAgBmh+HJILDIAESIAESIAESIAESIAESsJYAzY+1fNk6CZAACZAACZAACZAACZCAQwjQ/DgkERwGCZAACZAACZAACZAACZCAtQRofqzly9ZJgARIgARIgARIgARIgAQcQoDmxyGJ4DBIgARIgARIgARIgARIgASsJUDzYy1ftk4CJEACJEACJEACJEACJOAQAjQ/DkkEh0ECJEACJEACJEACJEACJGAtAZofa/mydRIgARIgARIgARIgARIgAYcQiDA/DhkPh0ECJEACJEACJEACJEACJEAClhH4Pw6UL0oyUrjCAAAAAElFTkSuQmCC";

    var authText = `When you first sign up, you start with Authority = 1 and your pages will have the following restrictions:<br><ul><li>8 blocks per page</li><li>Up to 3 minute Video & Audio blocks</li><li>Up to 100 MB blocks</li></ul>As you increase in Authority (which is earned by creating successful pages) you gain the ability to add more blocks with larger sizes.<br><br>Increases in Authority also allow you to contribute in other ways to the community, like creating Tags for the Subject, Category, Topic tree.`;

    var conText = `"Bengine", the block engine, is open source. If you want to create your own blocks or add features, go here: <a href="https://github.com/efossas/Bengine" target="_blank">Bengine Repository</a>.<br><br>Signing up is currently restricted by request. If you would like to request access to WisePool, make any comments, or suggest features you would like to see added to WisePool, please use the form below. Thank you!`;

    var blockOptionsRulEngine = {
        enableSave:false
    };

    var rulesEngine = new Bengine(blockExtensibles,blockCustomFunctions,blockOptionsRulEngine);
    rulesEngine.blockContentShow('rulesEngine',['',0,0],['title','About WisePool','xtext',rulText,'title','The Hierarchy','xtext',treeText,'image',treeImg,'title','Authority','xtext',authText,'title','Contribute','xtext',conText]);

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

    var hr3 = document.createElement('hr');
    hr3.setAttribute('style','margin:30px 0px 40px 0px;');
    tutorial.appendChild(hr3);
    tutorial.appendChild(tutForm);
}
