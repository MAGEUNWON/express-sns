const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const {Post, User, Hashtag} = require('../models');
// const bcrypt  = require('bcrypt');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user; // 넌적스에서 user 객체를 통해 사용자 정보에 접근할 수 있게 되었음.
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followerIdList = req.user?.Followings?.map(f => f.id) || [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', {title: '내 정보 - NodeBird'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {title: '회원가입 - NodeBird'});
});

// router.get('/', (req, res, next) => {
//   const twits = [];
//   res.render('main', {
//     title: 'NodeBird',
//     twits,
//   });
// });

router.get('/', async(req, res, next)=>{
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order:[['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next)=>{
  const query = req.query.hashtag;
  if(!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({where: {title: query}});
    let posts = [];
    if(hashtag) {
      posts = await hashtag.getPosts({include: [{model: User}]});
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch(error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;

