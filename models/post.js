//var mongodb = require('./db');

var url = 'mongodb://localhost:27017/blog';
var mongodb = require('mongodb').MongoClient;
var assert = require('assert');

function Post(email, post, time) {
  this.email = email;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};
module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    email: this.email,
    post: this.post,
    time: this.time,
  };
  mongodb.connect(url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 爲 user 屬性添加索引
      collection.ensureIndex('user');
      // 寫入 post 文檔
      collection.insert(post, {safe: true}, function(err, post) {
        db.close();
        callback(err, post);
      });
    });
  });
};

Post.get = function get(email, callback) {
  console.log(' Post 1 ');
  mongodb.connect(url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    console.log(' Post 2 ');
    db.collection('posts', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 查找 user 屬性爲 email 的文檔，如果 email 是 null 則匹配全部
      var query = {};
      if (email) {
        query.email = email;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        db.close();
        if (err) {
          callback(err, null);
        }
        // 封裝 posts 爲 Post 對象
        var posts = [];
        docs.forEach(function(doc, index) {
          var post = new Post(doc.email, doc.post, doc.time);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};
