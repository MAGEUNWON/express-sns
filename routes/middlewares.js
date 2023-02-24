exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){  //로그인 중이면 req.isAuthenticate()가 true, 그렇지 않으면 false. 로그인 여부를 이 메서드로 파악. 
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};


exports.isNotLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};