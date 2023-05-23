// const { DESCRIBE } = require('sequelize/types/query-types');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

// 함수를 모킹할 때는 jest.fn 메서드를 사용함. 
// 모킹이랑 가짜 객체와 함수를 만들어 넣는 행위를 말함. 테스트 코드의 객체가 실제 익스프레스 객체가 아니어도 됨. 
// 함수의 반환값을 지정하고 싶다면 jest.fn(() => 반환값을 사용)
// describe 함수는 테스트를 그룹화해주는 역할을 함. 첫 번째 인수는 그룹에 대한 설명, 두 번째 인수인 함수는 그룹에 대한 내용임.
describe('isLoggedIn', () => {
  const res = {
    status: jest.fn(() => res),
    send :  jest.fn(),
  };
  const next = jest.fn();

  test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함', () => {
    const req = {
      isAuthenticated: jest.fn(() => true), // isAuthenticated는 로그인 여부를 알려주는 함수이므로 true나 false를 반환
    };
    isLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1); // toBeCalledTimes(숫자)는 정확하게 몇 번 호출 되었는지를 체크하는 메서드
  });

  test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함', () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isLoggedIn(req, res, next);
    expect(res.status).toBeCalledWith(403); // res.status는 res.status(403).send('hello')처럼 메서드 체이닝이 가능해야 하므로 res를 반환
    // 실제로 req나 res 객체에 많은 속성과 메서드가 들어 있겠지만 지금 테스트에서는 isAuthenticated나 status, send만 사용하므로 나머지는 제외하면 됨
    expect(res.send).toBeCalledWith('로그인 필요') // toBeCalledWith(인수)는 특정 인수와 함께 호출되었는지를 체크하는 메서드
  });
});

describe('isNotLoggedIn', () => {
  const res = {
    redirect : jest.fn(),
  };
  const next = jest.fn();

  test('로그인이 되어 있으면 isNotLoggedIn이 에러를 응답해야 함', () => {
    const req = {
      isAuthenticated : jest.fn(() => true),
    };
    isNotLoggedIn(req, res, next);
    const message = encodeURIComponent('로그인한 상태입니다.');
    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });

  test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함', () => {
    const req = {
      isAuthenticated : jest.fn(() => false),
    };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});

// 이렇게 작은 단위의 함수나 모듈이 의도된 대로 정확히 작동하는지 테스트하는 것을 유닛 테스트(unit test) 또는 단위 테스트라고 함. 
// 나중에 함수를 수정하면 기존에 작성해둔 테스트는 실패하게 됨. 
// 따라서 함수가 수정되었을 때 어떤 부분이 고장나는지를 테스트를 통해 할 수 있음. 테스트 코드도 기존 코드가 변경된 것에 맞춰서 수정해야 함. 