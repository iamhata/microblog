//var mongodb = require('./db');


var url = 'mongodb://localhost:27017/blog';
var mongodb = require('mongodb').MongoClient;
var assert = require('assert');

function User(user) {
  this.password = user.password;
  this.email = user.email;
  this.lastname = user.lastname;
  this.firstname = user.firstname;
  this.username = user.username;
  this.picture = user.picture;
  this.aboutyou = user.aboutyou;
};
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    password: this.password,
    email: this.email,
    lastname: this.lastname,
    firstname: this.firstname,
    username: this.username,
    picture: this.picture,
    aboutyou: this.aboutyou,
  };
  mongodb.connect(url, function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 爲 email 屬性添加索引
      collection.ensureIndex('email', {unique: true});
      // 寫入 user 文檔
      collection.insert(user, {safe: true}, function(err, user) {
        db.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(email, callback) {
  mongodb.connect(url, function(err, db) {
    console.log('1.User.get:'+email);
    if (err) {
      db.close();
      return callback(err);
    }
    // 讀取 users 集合

    db.collection('users', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
       console.log('2.User.get:'+email);
      
      collection.findOne({email: email}, function(err, doc) {
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new User(doc);
          console.log('3.User.get:'+ JSON.stringify(user));
          callback(err, user);
        } else {
           db.close();
          callback(err, null);
        }
        db.close();
      });
    });
  });
};

User.update = function update(user, callback){
    mongodb.connect(url, function(err, db) {
     
    if (err) {
      db.close();
      return callback(err);
    }
    
    db.collection('users', function(err, collection) {
        console.log('User.update:'+JSON.stringify(user));
        
        collection.update({email:user.email},
          {$set: {password:user.password,
                  lastname:user.lastname,
                  firstname:user.firstname,
                  aboutyou:user.aboutyou,
                  username:user.username,
                  picture:user.picture
               }},
               {w:1},function(err,result){
               }
        );
        db.close();
        if(!err){
          return callback(err,null);
        }
    });
});
};

