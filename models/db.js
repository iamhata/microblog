/*
var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

module.exports = new Db(settings.db, new Server(settings.host,'27107', {}));
*/

/*
var mongoose = require('mongoose');

var mongoURI = "mongodb://localhost:27017/test";
var mongodb = mongoose.connect(mongoURI).connection;


module.exports = mongodb;
*/

var mongodb = require('mongodb');