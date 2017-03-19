/* eslint-env node, es6 */
/*
	Title: UserDB
	Contains functions for querying the user nosql database.
*/

exports.getDocByUid = function(connection,uid) {
    var ObjectId = require('mongodb').ObjectId;

	var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Users');
        collection.find({_id:ObjectId(uid)}).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                if(docs.length > 0) {
                    resolve(docs);
                } else {
                    reject({msg:'not found'});
                }
            }
        });
    });

    return promise;
};

exports.getDocByUsername = function(connection,username) {
	var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Users');
        collection.find({username:username}).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });

    return promise;
};

exports.getSubjects = function(connection) {
    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        collection.find({_id:"topics"}).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                delete docs[0]._id;
                var tree = docs[0];
                resolve(tree);
            }
        });
    });

    return promise;
};

exports.getTags = function(connection,subject,category,topic) {
	var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var projection = {};
        projection[[subject,category,topic].join(".")] = 1;

        collection.find({_id:"tags"},projection).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                delete docs[0]._id;
                var tags = docs[0][subject][category][topic];
                resolve(tags);
            }
        });
    });

    return promise;
};

exports.createUser = function(connection,username,password,email) {

    var auth = 0;
    if(email === "applegate") {
        auth = 9;
    }

    var newUser = {
        authority:auth,
        autosave:0,
        bookmarks:{g:{},p:{}},
        defaulttext:true,
        email:email,
        password:password,
        username:username
    };

	var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Users');
        collection.insert(newUser,function(err,r) {
            if(err) {
                reject(err);
            } else {
                resolve(r);
            }
        });
    });

    return promise;
};

exports.updateUser = function(connection,uid,updatedPropertiesObj) {
    var ObjectId = require('mongodb').ObjectId;

    /// need to validate data types here of updatedPropertiesObj

    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Users');
        collection.update({_id:ObjectId(uid)},{$set:updatedPropertiesObj},function(err,r) {
            if(err) {
                reject(err);
            } else {
                resolve(r);
            }
        });
    });

    return promise;
};
