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

exports.createUser = function(connection,username,password,email) {

    var newUser = {
        autosave:0,
        bookmarks:{g:{},p:{}},
        defaulttext:1,
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
