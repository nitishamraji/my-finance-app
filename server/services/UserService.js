const db = require('../sequelize/models');

class UserService {

  async loginUser(userJson) {
    let success = false;
    let msg = '';

    try {
      const userId = userJson.userId;
      const user = await db.User.findByPk(userId);

      if( user ) {

        if( user.approved ) {
          success = true;
          msg = 'Success';
        } else {
          msg = 'Pending approval';
        }

      } else {
        msg = 'User ID does not exists';
      }
    } catch(e) {
      console.log(e);
      msg = 'Error';
    }

    return {success: success, msg: msg}
  }

  async registerUser(userJson) {
    let success = false;
    let msg = '';
    try {

      const userId = userJson.userId;
      const user = await db.User.findByPk(userId);

      if( user ) {
        msg = 'User ID already exists';
      } else {
        const userName = userJson.userName;
        let approved = false;
        let role = 'standard';

        if( userId === 'nitishamraji951') {
          approved = true;
          role = 'admin';
        }

        const createdUser = await db.User.create({
          userId: userId,
          userName: userName,
          approved: approved,
          role: role
        });

        if ( createdUser && createdUser.userId === userId ) {
          success = true;
          msg = 'Registered successfully. Pending approval.';
        } else {
          msg = 'User ID already exists';
        }

      }
    } catch(e) {
      console.log(e);
      success = false;
      msg = 'Error';
    }

    return {success: success, msg: msg}
  }

}

module.exports = UserService;
