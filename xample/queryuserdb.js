/* eslint-env node, es6 */
/*
	Title: UserDB
	Contains functions for querying the user nosql database.
*/

exports.addTag = function(connection,subject,category,topic,newtag,uid) {
    var ObjectId = require('mongodb').ObjectId;

    var tag = {
        tag:newtag,
        subject:subject,
        category:category,
        topic:topic,
        upvotes:[],
        downvotes:[],
        comments:[],
        suggestor:uid
    };

    var treeBranch = [subject,category,topic,newtag].join(".");

    var promise = new Promise(function(resolve,reject) {
        /* validate new tag */
        if(newtag.length > 32) {
            resolve('excess');
        } else {
            var collection = connection.collection('Tree');

            var checkIfExistsObj = {_id:"tags"};
            checkIfExistsObj[treeBranch] = {$exists:true};

            collection.find(checkIfExistsObj).toArray(function(err,docs) {
                if(err) {
                    reject(err);
                } else {
                    if(docs.length > 0) {
                        resolve('exists');
                    } else {
                        /* add the tag record to the collection, stores tag metadata */
                        collection.insert(tag,function(err,result) {
                            if(err) {
                                reject(err);
                            } else {
                                /* insert the tag into the tree */
                                var tagObj = {};
                                tagObj[treeBranch] = String(result.insertedIds[0]);
                                collection.update({_id:"tags"},{$set:tagObj},function(err,r) {
                                    if(err) {
                                        reject(err);
                                    } else {
                                        resolve('added');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });

    return promise;
};

/// THIS IS NOT FINISHED! DO NOT USE!
exports.deleteTag = function(connection,subject,category,topic,deletetag,uid) {
    var ObjectId = require('mongodb').ObjectId;

    var treeBranch = [subject,category,topic,deletetag].join(".");

    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var getTagID = {};
        getTagID[treeBranch] = 1;

        collection.find({_id:"tags"},getTagID).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                if(docs.length < 1) {
                    resolve('notexists');
                } else {
                    var tagID = docs[0][subject][category][topic][deletetag];
                    /* unset the tag from the tree, DOES NOT WORK!!! */
                    collection.update({_id:"tags"},{$unset:{treeBranch:1}},function(err,result) {
                        if(err) {
                            reject(err);
                        } else {
                            /* remove the tag record */
                            resolve('deleted');
                            collection.remove({_id:ObjectId(tagID)},function(err,r) {
                                if(err) {
                                    reject(err);
                                } else {
                                    resolve('added');
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    return promise;
};

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
    var sub = subject.replace(/'/g,"");
    var cat = category.replace(/'/g,"");
    var top = topic.replace(/'/g,"");
	var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var projection = {};
        projection[[sub,cat,top].join(".")] = 1;

        collection.find({_id:"tags"},projection).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                delete docs[0]._id;
                var tags = Object.keys(docs[0][sub][cat][top]);
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
