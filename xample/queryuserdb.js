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

exports.setTagComment = function(connection,subject,category,topic,tag,newComment) {
    var ObjectId = require('mongodb').ObjectId;

    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var projection = {};
        projection[[subject,category,topic].join(".")] = 1;

        collection.find({_id:"tags"},projection).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                var tagID = docs[0][subject][category][topic][tag];

                var pushObj = {$push:{comments:newComment}};

                collection.update({_id:ObjectId(tagID)},pushObj,function(err,r) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(r.result.nModified);
                    }
                });
            }
        });
    });

    return promise;
};

exports.setTagVote = function(connection,uid,subject,category,topic,tag,vote) {
    var ObjectId = require('mongodb').ObjectId;

    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var projection = {};
        projection[[subject,category,topic].join(".")] = 1;

        collection.find({_id:"tags"},projection).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                var tagID = docs[0][subject][category][topic][tag];

                var voteToAdd;
                var voteToRemove;
                if(vote === "up") {
                    voteToAdd = {upvotes:uid};
                    voteToRemove = {downvotes:uid};
                } else if (vote === "down") {
                    voteToAdd = {downvotes:uid};
                    voteToRemove = {upvotes:uid};
                } else {
                    reject('badvote');
                }

                /* add vote, and possibly remove previous vote */
                collection.update({_id:ObjectId(tagID)},{$addToSet:voteToAdd},function(err,rAdd) {
                    if(err) {
                        reject(err);
                    } else {
                        collection.update({_id:ObjectId(tagID)},{$pull:voteToRemove},function(err,rRemove) {
                            if(err) {
                                reject(err);
                            } else {
                                resolve([rAdd.result.nModified,rRemove.result.nModified]);
                            }
                        });
                    }
                });
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
                try {
                    delete docs[0]._id;
                    var tags = Object.keys(docs[0][sub][cat][top]);
                    resolve(tags);
                } catch(error) {
                    reject(error);
                }
            }
        });
    });

    return promise;
};

exports.getTagData = function(connection,subject,category,topic,tagname) {
    var ObjectId = require('mongodb').ObjectId;

    var promise = new Promise(function(resolve,reject) {
        var collection = connection.collection('Tree');

        var projection = {};
        projection[[subject,category,topic,tagname].join(".")] = 1;

        collection.find({_id:"tags"},projection).toArray(function(err,docs) {
            if(err) {
                reject(err);
            } else {
                var tagID = docs[0][subject][category][topic][tagname];
                collection.find({_id:ObjectId(tagID)}).toArray(function(err,r) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(r[0]);
                    }
                });
            }
        });
    });

    return promise;
};

exports.createUser = function(connection,username,password,email) {
    var fs = require('fs');

    /*
        authority   :
            9 - internal
            8 -
            7 - can suggest tree
            6 - can suggest tags
            5 - can post to bulletin
            4 - can fork                    > create 20 bp with 90% rank
            3 - expanded page creation      > create 10 bp with 90% rank
            2 - can comment on pages        > create 3 bp || 3 lg with 90% rank
            1 - can like, favorite, & flag  > create bp || ts with 50+ likes
            0 - new user, no auth           > create bp || ts with 50+ views/completions
        autosave    : pages save after # seconds, 0 for off
        bookmarks   : user's bookmarks
        defaulttext : blocks display default text on creation
        email       : user's email
        password    : user's password
        username    : user's username
    */
    var newUser = {
        authority:0,
        autosave:0,
        bookmarks:{g:{},p:{}},
        defaulttext:true,
        email:email,
        password:password,
        username:username
    };

	var promise = new Promise(function(resolve,reject) {
        /* check if this new user gets special authority */
        fs.readFile('./data/emails.json','utf8',function(err,data) {
            if(err) {
                reject(err);
            } else {

                /// OPEN THIS UP LATER!!!
                var approved = false;

                /* give user special authority if on the email list */
                var emailArray = JSON.parse(data);
                if(email === "applegate" || emailArray.indexOf(email) > -1) {
                    newUser.authority = 6;
                    approved = true;
                }

                if(approved) {
                    var collection = connection.collection('Users');
                    collection.insert(newUser,function(err,r) {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(r);
                        }
                    });
                } else {
                    resolve('closed');
                }
            }
        });
    });

    return promise;
};

exports.updateUser = function(connection,uid,updatedPropObj) {
    var ObjectId = require('mongodb').ObjectId;

    var v = require("./validation.js");

    var promise = new Promise(function(resolve,reject) {
        for (var prop in updatedPropObj) {
            if (updatedPropObj.hasOwnProperty(prop)) {
                if(v.isNumeric(updatedPropObj[prop])) {
                    updatedPropObj[prop] = Number(updatedPropObj[prop]);
                }
                switch(prop) {
                    case "authority":
                        // internal
                        break;
                    case "autosave":
                        if(!v.isInt(updatedPropObj[prop]) || updatedPropObj[prop] < 0) {
                            reject("badtype"); return;
                        }
                        break;
                    case "bookmarks":
                        // internal
                        break;
                    case "defaulttext":
                        if(!v.isBool(updatedPropObj[prop])) {
                            reject("badtype"); return;
                        } else {
                            updatedPropObj[prop] = Boolean(updatedPropObj[prop]);
                        }
                        break;
                    case "email":
                        if(!v.isStr(updatedPropObj[prop]) || updatedPropObj[prop].indexOf('@') < 0) {
                            reject("badtype"); return;
                        }
                        break;
                    case "password":
                        // internal
                        break;
                    case "phone":
                        if(v.isStr(updatedPropObj[prop])) {
                            updatedPropObj[prop] = Number(updatedPropObj[prop].replace(/[^0-9]/g,''));
                        }
                        break;
                    case "username":
                        if(!v.isStr(updatedPropObj[prop])) {
                            reject("badtype"); return;
                        }
                        break;
                    default:
                        /* unknown property */
                        reject("unknown"); return;
                }
            }
        }

        var collection = connection.collection('Users');
        collection.update({_id:ObjectId(uid)},{$set:updatedPropObj},function(err,r) {
            if(err) {
                reject(err);
            } else {
                resolve(r);
            }
        });
    });

    return promise;
};
