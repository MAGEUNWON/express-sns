const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //로그인 전략을 구현
const bcrypt = require('bcrypt');

const User = require('../models/user');

//LocalStrategy 생성자의 첫 번째 인수로 주어진 객체는 전략에 관한 설정을 하는 곳. 
module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', //usernameField 필드와 passwordField에 일치하는 로그인 라우터의 req.boby 속성명을 적으면됨. 
    passwordField: 'password',
  }, async(email, password, done)=>{  // 실제 전략을 수행하는 async 함수. LocalStrategy 생성자의 두 번째 인수로 들어감. 첫 번째 인수에서 넣어준 email과 password는 각각 async 함수의 첫 번째와 두 번째 매개변수가 됨. 세 번째 매게변수인 done 함수는 passport.authenticate의 콜백 함수임. 
    try {
      const exUser = await User.findOne({where:{email} });
      if(exUser){
        const result = await bcrypt.compare(password, exUser.password);
        if(result) {
          done(null, exUser);
        } else {
          done(null, false, { message : '비밀번호가 일치하지 않습니다.'});
        }
      } else {
        done(null, false, {message: '가입되지 않은 회원입니다.'});
      }
    } catch(error) {
      console.error(error);
      done(error);
    }
  }));
};

//전략의 내용 => 사용자 데이터베이스에서 일치하는 이메일이 있는지 찾은 후, 있다면 bcrypt의 compare 함수로 비밀번호를 비교. 비밀번호까지 일치한다면 done 함수의 두 번째 인수로 사용자 정보를 넣어 보냄. 두 번째 인수를 사용하지 않는 경우는 로그인에 실패했을 때일뿐. done 함수의 첫 번째 인수를 사용하는 경우는 서버 쪽에서 에러가 발생했을 때이고, 세 번째 인수를 사용하는 경우는 로그인 처리 과정에서 비밀번호가 일치하지 않거나 존재하지 않는 회원일 때와 같은 사용자 정의 에러가 발생했을 때임. done이 호출된 후에는 다시 passport.authenticate의 콜백 함수에서 나머지 로직이 실행됨. 로그인에 성공했다면 메인 페이지로 리다이렉트되면서 로그인 폼 대신 회원 정보가 뜰 것. 