const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//회원가입 라우터
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password} = req.body;
  try{
    const exUser = await User.findOne({where:{email}}); // 같은 이메일로 가입한 사용자 있는지 확인
    if(exUser) {
      return res.redirect('./join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12); //비밀번호를 암호화하고, 사용자 정보 생성. bcrypt 모듈로 비밀번호 암호화함.(crypto 모듈의 pbkdf2 메서드를 사용해서 함호화 할 수도 있음.) bcrypt의 두 번째 인수는 pbkdf2의 반복 횟수와 비슷한 기능을 함. 숫자가 커질수록 비밀번호를 알아내기 어려워지지만 암호화 시간도 오래 걸림. 12 이상을 추천하며 31까지 사용할 수 있음. 
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch(error) {
    console.error(error);
    return next(error)
  }
});

//로그인 라우터
router.post('/login', isNotLoggedIn, (req, res, next)=>{
  passport.authenticate('local', (authError, user, info)=> {  //미들웨어인데 라우터 미들웨어 안에 들어 있음. 미들웨어에 사용자 정의를 추가하고 싶을 때 이렇게 할 수 있음. 이럴 때는 내부 미들웨어에 (req, res, next)를 인수로 제공해서 호출하면 됨. 
    if(authError) {
      console.error(authError);
      return next(authError);
    }
    if(!user){
      return res.redirect(`./?loginError=${info.message}`);
    }
    req.login(user, (loginError) =>{
      if(loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});
//     return res.redirect(user, (loginError) =>{
//       if(loginError) {
//         console.error(loginError);
//         return next(loginError);
//       }
//       return res.redirect('/');
//     });
//   })(req, res, next); //미들웨어 내의 미들웨어에는 (req, res, next)를 붙임.
// });
// req.login() 메서드를 사용하여 로그인합니다. 이 방법은 passport 모듈의 기본 제공 기능이므로 로그인 처리를 간편하게 할 수 있음.
// res.redirect() 메서드는 더 이상 콜백 함수를 사용하지 않음. 따라서 로그인 오류가 발생하면 오류 처리 미들웨어(next)로 전달됨.

//로그아웃 라우터. 
router.get('/logout', isLoggedIn, (req, res)=> { //req.logout 메서드는 req.user 객체를 제거. req.session.distroy는 req.session 객체의 내용을 제거함. 세션 정보를 지운 후 메인 페이지로 되돌아감. 
  req.logout(err => {
    if(err) return next(err);
    req.session.destroy(err => {
      if(err) return next(err);
      res.redirect('/');
    })
  });
  // req.session.destroy();
  // res.redirect('/');
});
//req.logout()에 콜백 함수를 전달해야 함. req.logout()은 현재 세션에서 사용자를 로그아웃하고 로그아웃 작업이 완료되면 콜백을 호출. req.logout()을 호출할 때 콜백을 지정하지 않으면 오류 발생함. 
//콜백 함수가 에러를 처리하고 로그아웃 작업이 완료된 후 다음 단계를 처리함. 여기서는 세션을 파괴하고 메인 페이지로 리디렉션함. 

//카카오 로그인 라우터
router.get('/kakao', passport.authenticate('kakao'));  //GET /auth/kakao로 접근하면 카카오 로그인 과정이 시작됨. layout.html의 카카오톡 버튼에 /auth/kakao 링크가 붙어 있음. GET /auth/kakao에서 로그인 전략을 수행하는데, 처음에는 카카오 로그인 창으로 리다이렉트함. 그 창에서 로그인 후 성공 여부 결과를 GET /auth/kakao/callback으로 받음. 이 라우터에서는 카카오 로그인 전략을 다시 수행함. 

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res)=>{
  res.redirect('/');
});
//로컬 로그인과 다른 점은 passport.authenticate 메서드에 콜백함수를 제공하지 않는다는 점. 카카오 로그인은 로그인 성공시 내부적으로 req.login을 호출하므로 직접 호출할 필요가 없음. 콜백 함수 대신 로그인에 실패했을 때 어디로 이동할지를 failureRedirect 속성에 적고, 성공시에도 어디로 이동할지를 다음 미들웨어에 적음. 추가한 auth 라우터를 app.js에 연결함. 


module.exports = router;