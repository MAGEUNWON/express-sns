const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user; // 넌적스에서 user 객체를 통해 사용자 정보에 접근할 수 있게 되었음.
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', {title: '내 정보 - NodeBird'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {title: '회원가입 - NodeBird'});
});

router.get('/', (req, res, next) => {
  const twits = [];
  res.render('main', {
    title: 'NodeBird',
    twits,
  });
});

module.exports = router;