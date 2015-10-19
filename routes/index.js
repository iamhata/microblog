var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var url  = require('url');
var multer = require('multer'); //process upload files
var fs = require('fs');
var busboy = require('connect-busboy');
//var path = require('path');
var User = require('../models/user.js');
var Post = require('../models/post.js');

 var formidable = require('formidable'),
      util = require('util');

/* GET home page. */
router.get('/', function(req, res) {
	console.log('starting Post');
	Post.get(null, function(err, posts) {
		if(err){
			posts = [];
		}
		console.log('started Post');
		res.render( 'index', {
			title : '歡迎來到 _nEIL 網站', 
			posts : posts,
			user : req.session.user,
			success : req.flash('success'),
			error : req.flash('error')
		});	
	});

});


router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
	res.render('reg',
		{title :'使用者註冊',
		user:req.session.user,
		success:req.flash('success'),
		error:req.flash('error')
	});
});

router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res){
	if(req.body['password-repeat'] != req.body['password']){
		req.flash('error','兩次輸入的密碼不一致');
		return res.redirect('/reg');
	}

	//產生密碼的雜湊值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User ({
		email: req.body.email,
		password: password,
      	lastname: '',
      	firstname: '',
      	aboutyou: '',
      	username: '',
      	picture: ''
	});
	
	User.get(newUser.email, function(err, user){
		
		if(user)
			err = 'User Email already exists.';
		if(err){
			req.flash('error', err);
			console.log('error:'+err);
			return res.redirect('/reg');
		}
		
		
		//如果不存在則新增使用者
		newUser.save(function(err){
			if(err){
				return req.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', newUser.email + ' 註冊成功');
			res.redirect('/');
		});

	})

});


router.get('/login',checkNotLogin);
router.get('/login',function(req, res,next){

	res.render('login',{
		title:'使用者登入',
		user:req.session.user,
		success:req.flash('success'),
		error:req.flash('error')
	});
});

router.post('/login',checkNotLogin);
router.post('/login',function(req,res,next){
	//產生密碼的雜湊值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	User.get(req.body.email,function(err,user){
		console.log('3.login:'+ JSON.stringify(user));
		if(!user){
			req.flash('error','使用者不存在');
			return res.redirect('/login');
		}
		console.log('4.login' );
		console.log('user.password:'+user.password);
		console.log('from.password:'+password);
		if(user.password != password){
			req.flash('error','使用者密碼錯誤');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success',user.email+ ' 登入成功');
		console.log('5.login' );

		res.redirect('/');
	});

});




router.get('/reg',checkLogin);
router.get('/logout',function(req, res){
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});


router.post('/post',checkLogin);
router.post('/post',function (req, res,next){
	var currentUser = req.session.user;
	var post = new Post(currentUser.email, req.body.post);
	console.log('1.post:'+JSON.stringify(post));
	post.save(function(err){
		if(err){
			console.log('2.post:'+JSON.stringify(err));
			req.flash('error',err);
			return res.redirect('/');
		}
		console.log('3.post:'+JSON.stringify(currentUser.email));
		req.flash('success',' 發表成功');
		res.redirect('/u/'+ currentUser.email);
	});
});

router.get('/u/:user',function(req, res,next){
	User.get(req.params.user, function(err, user){
		console.log('u/:user  ' + JSON.stringify(user));
		if(!user){
			req.flash('error','使用者不存在');
			return res.redirect('/');
		}
		Post.get(user.email, function(err, posts){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}

			res.render('user',{
				user:user,
				title: user.email,
				posts:posts
			});
		});

	});
});


router.get('/profile',function(req, res,next){
	console.log('req.query.email:'+req.query.email);
	User.get(req.query.email, function(err, user){
		if(!user){
			req.flash('error','使用者不存在');
			return res.redirect('/');
		}else{
			res.render('profile',{
				user:user,
				title: user.email,
				success:'',
				error:''
			});

		}

	});
});


router.post('/profile',function(req, res,next){
  var form = new formidable.IncomingForm();
  var fstream;

  req.pipe(req.busboy);
  req.busboy.on('file',function(filename,file,filename){
		fstream = fs.createWriteStream('./public/images/'+filename);		
		file.pipe(fstream);
	    fstream.on('close', function () { });
   });


  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err.message);
    }
	console.log('form.parse1:'+JSON.stringify(files));
   
	var md5 = crypto.createHash('md5');
	var password = md5.update(fields.password).digest('base64');
	console.log('Uploading123:'+files.picture.name);

	var newUser = new User ({
		email: fields.email,
		password: password,
      	lastname: fields.lastname,
      	firstname: fields.firstname,
        picture: files.picture.name,
      	aboutyou: fields.aboutyou,
      	username: fields.username,
      
	});

	console.log('alterUser:'+JSON.stringify(newUser));
	
	User.update(newUser ,function(err,user){
		if(err){
			console.log('err');
			req.flash('error',err);
			res.redirect('/');			
		}else{
			console.log('success');
			req.flash('success',' 修改成功');
			res.redirect('/');	
		}
	}); 


  });

});


function checkLogin(req , res, next){
	if(!req.session.user){
		req.flash('error','未登入');
		return res.redirect('/login');
	}
	next();
}


function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error','已登入');
		return res.redirect('/');
	}
	next();
}




module.exports = router;
