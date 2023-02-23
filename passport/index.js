const passport = require('passport');
const local = require('./loaclStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.export = () => {
  passport.serializeUser((user, done)=> {
    done(null, user.id);
  });

  passport.deserializeUser((id, done)=> {
    User.findOne({where: {id}})
      .then(user => done(null, user))
      .catch(err => done(err));
  });
  
  local();
  kakao();
};
