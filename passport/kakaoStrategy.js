const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy; // passport-kakao 모듈로부터 Strategy 생성자를 불러와 전략을 구현

const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({ //로컬 로그인과 마찬가지로 카카오 로그인에 대한 설정을 함. 
    clientID: process.env.KAKAO_ID, //clientId는 카카오에서 발급해주는 아이디. 노출 되지 않아야 해서 process.env.KAKAO_ID로 설정. 나중에 id 발급 받아 env에 넣어줄 것. 
    callbackURL: '/auth/kakao/callback', //callbackURL은 카카오로부터 인증 결과를 받은 라우터 주소임. 아래에서 라우터를 작성할 때 이 주소를 사용
  }, async(accessToken, refreshToken, profile, done)=>{ // 먼저 기존에 카카오를 통해 회원가입한 사용자가 있는지 조회. 이미 회원가입 되있다면 사용자 정보와 함께 done 함수를 호출하고 전략을 종료함. 
    console.log('kakao profile', profile);
    try {
      const exUser = await User.findOne({
        where: {snsId: profile.id, provider: 'kakao'},
      });
      if(exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({ //카카오를 통해 회원가입한 사용자가 없다면 회원가입을 진행. 카카오에서는 인증 후 callbackURL에 적힌 주소로 accessToken, refreshToken과 profile을 보냄. profile에는 사용자 정보들이 들어있음. 카카오에서 보내주는 것이므로 데이터는 console.log 메서드로 확인해보는 것이 좋음. profile 객체에서 원하는 정보를 꺼내와 회원가입을하면 됨. 사용자를 생성한 뒤 done 함수를 호출
          email: profile._json && profile._json.kakao_account_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch(error){
      console.error(error);
      done(error);
    }
  }));
};