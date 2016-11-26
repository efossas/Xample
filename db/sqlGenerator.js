/* eslint-env node, es6 */

var fs = require('fs');

fs.readFile('../xample/data/topics.json','utf8',function(err,data) {
    if (err) {
        throw err;
    }

    var sqlFile = "";
    var tree = JSON.parse(data);

    var subjects = Object.keys(tree);
    var subjectsCount = subjects.length;

    for(var i = 0; i < subjectsCount; i++) {
        var categories = Object.keys(tree[subjects[i]]);
        var categoriesCount = categories.length;

        /* subject */
        var prefixSub = ["qp_","lg_"];
        prefixSub.forEach(function(prefix,index) {
            var sqlSubjectArray = ["CREATE TABLE ",prefix,subjects[i].replace(/ /g,"")," (uid INT UNSIGNED, pid SMALLINT UNSIGNED, pagename VARCHAR(50), tags BIGINT UNSIGNED, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,pid), KEY(created), KEY(edited), KEY(ranks), KEY(views) );\n"];

            sqlFile += sqlSubjectArray.join("");
        });

        for(var j = 0; j < categoriesCount; j++) {
            /* subject_category */
            var prefixCat = ["qp_","lg_"];
            prefixCat.forEach(function(prefix,index) {
                var sqlCategoryArray = ["CREATE TABLE ",prefix,subjects[i].replace(/ /g,""),"_",categories[j].replace(/ /g,"")," (uid INT UNSIGNED, pid SMALLINT UNSIGNED, pagename VARCHAR(50), tags BIGINT UNSIGNED, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,pid), KEY(created), KEY(edited), KEY(ranks), KEY(views) );\n"];

                sqlFile += sqlCategoryArray.join("");
            });

            var topics = tree[subjects[i]][categories[j]];
            topics.forEach(function(item,index) {
                /* subject_category_topic */
                var prefixTop = ["qp_","lg_"];
                prefixTop.forEach(function(prefix,index) {
                    var sqlTopicArray = ["CREATE TABLE ",prefix,subjects[i].replace(/ /g,""),"_",categories[j].replace(/ /g,""),"_",item.replace(/ /g,"")," (uid INT UNSIGNED, pid SMALLINT UNSIGNED, pagename VARCHAR(50), tags BIGINT UNSIGNED, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,pid), KEY(created), KEY(edited), KEY(ranks), KEY(views) );\n"];

                    sqlFile += sqlTopicArray.join("");
                });
            });
        }
    }

    fs.writeFile("setup.sql",sqlFile,function(err) {
        if(err) {
            throw err;
        }
    });
});
