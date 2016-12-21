/* eslint-env node, es6 */

var fs = require('fs');

fs.readFile('../xample/data/topics.json','utf8',function(err,data) {
    if (err) {
        throw err;
    }

    /* grab first two letters of each word */
    function reduceName(str) {
        var reduced = str.match(/^([a-zA-Z]){2}| ([a-zA-Z]){2}/g).join("").replace(/ /g,"");
        return reduced;
    }

    /* check for duplicate table names function */
    var tableNamesArray = [];
    function check(tableName) {
        var duplicates = tableNamesArray.filter(function(element) {
            if(element === tableName) {
                return true;
            } else {
                return false;
            }
        });

        if(duplicates.length > 0) {
            console.log(tableName);
        }

        tableNamesArray.push(tableName);
    }

    console.log("If any duplicates are printed below, initialize.sql will fail:");

    var sqlFile = "";
    var tree = JSON.parse(data);

    var subjects = Object.keys(tree);
    var subjectsCount = subjects.length;

    for(var i = 0; i < subjectsCount; i++) {
        var categories = Object.keys(tree[subjects[i]]);
        var categoriesCount = categories.length;

        /* subject */
        var prefixSub = ["red_bp_","red_lg_"];
        prefixSub.forEach(function(prefix,index) {
            var tableName = prefix + reduceName(subjects[i]);
            check(tableName);

            var sqlSubjectArray = ["CREATE TABLE ",tableName," (uid INT UNSIGNED, xid SMALLINT UNSIGNED, xname VARCHAR(50), tags BIGINT UNSIGNED NOT NULL, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, rating SMALLINT UNSIGNED DEFAULT 0 NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,xid), KEY(created), KEY(edited), KEY(ranks), KEY(views), KEY(rating) );\n"];

            sqlFile += sqlSubjectArray.join("");
        });

        for(var j = 0; j < categoriesCount; j++) {
            /* subject_category */
            var prefixCat = ["red_bp_","red_lg_"];
            prefixCat.forEach(function(prefix,index) {
                var tableName = prefix + reduceName(subjects[i]) + "_" + reduceName(categories[j]);
                check(tableName);

                var sqlCategoryArray = ["CREATE TABLE ",tableName," (uid INT UNSIGNED, xid SMALLINT UNSIGNED, xname VARCHAR(50), tags BIGINT UNSIGNED NOT NULL, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, rating SMALLINT UNSIGNED DEFAULT 0 NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,xid), KEY(created), KEY(edited), KEY(ranks), KEY(views), KEY(rating) );\n"];

                sqlFile += sqlCategoryArray.join("");
            });

            var topics = tree[subjects[i]][categories[j]];
            topics.forEach(function(item,index) {
                /* subject_category_topic */
                var prefixTop = ["red_bp_","red_lg_"];
                prefixTop.forEach(function(prefix,index) {
                    var tableName = prefix + reduceName(subjects[i]) + "_" + reduceName(categories[j]) + "_" + reduceName(item);
                    check(tableName);

                    var sqlTopicArray = ["CREATE TABLE ",tableName," (uid INT UNSIGNED, xid SMALLINT UNSIGNED, xname VARCHAR(50), tags BIGINT UNSIGNED NOT NULL, created TIMESTAMP DEFAULT 0 NOT NULL, edited TIMESTAMP DEFAULT 0 NOT NULL, ranks INT UNSIGNED NOT NULL, views INT UNSIGNED NOT NULL, rating SMALLINT UNSIGNED DEFAULT 0 NOT NULL, imageurl VARCHAR(128), blurb VARCHAR(500), PRIMARY KEY(uid,xid), KEY(created), KEY(edited), KEY(ranks), KEY(views), KEY(rating) );\n"];

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
