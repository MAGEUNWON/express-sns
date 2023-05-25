jest.mock('../models/user'); // jest.mock에 모킹할 모듈의 경로를 인수로 넣고 그 모듈을 불러옴. 
const User = require('../models/user');
const { addFollowing } = require('./user');

describe('addFollowing', () => {
  const req = {
    user: {id : 1},
    params: {id: 2},
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();

  test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함', async () => {
    // jest.mock 에서 모킹할 메서드(User.findOne)에 mockReturnValue라는 메서드를 넣음. 이 메서드로 가짜 반환값을 지정할 수 있음. 
    User.findOne.mockReturnValue(Promise.resolve({
      addFollowing(id) { // 사용자를 찾아서 팔로잉을 추가하는 상황을 테스트하기 위해 addFollowing() 객체를 반환하도록 함
        return Promise.resolve(true);
      }
    }));
    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith('success');
  });

  test('사용자를 못 찾으면 res.status(404).send(no user)를 호출함', async () => {
    User.findOne.mockReturnValue(null); // null로 사용자 찾지 못한 상황 테스트 
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404)
    expect(res.send).toBeCalledWith('no user');
  });

  test('DB에서 에러가 발생하면 next(error) 호출함', async () => {
    const error = '테스트용 에러';
    User.findOne.mockReturnValue(Promise.reject(error)); // Promise reject로 에러가 발생하도록 함.
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});