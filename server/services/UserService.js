const db = require('../sequelize/models');

class UserService {

  async loginUser(userJson) {
    let success = false;
    let msg = '';

    try {
      const userId = userJson.userId;
      const user = await db.User.findOne({ where: { userId: userJson.userId } });

      if( user ) {

        if( user.approved ) {
          success = true;
          msg = 'Success';
        } else {
          msg = 'Pending approval';
        }

      } else {
        msg = 'User does not exists';
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

      const userId = userJson.userId.trim();
      const user = await db.User.findOne({ where: { userId: userId } });

      if( user ) {
        msg = 'User ID already exists';
      } else {
        const userName = userJson.userName.trim();
        let approved = false;
        let role = 'standard';

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

  async updateUserApproval(reqJson) {
    const res = { success: false, msg: ''}
    try {
      const userId = reqJson.userId;
      const approve = reqJson.approve;
      const userInfo = await db.User.findOne({ where: { userId: reqJson.userId } });
      const userRole = await userInfo.role;
      if( userInfo.role !== 'admin' ) {
        await userInfo.update({approved: approve});
        res.success = true;
        res.msg = 'Approved'
      }
    } catch(e) {
      console.log(e)
      msg='Error'
    }
    return res;
  }

  async updateUserProfile(reqJson) {
    const res = { success: false, msg: ''}
    try {
      const userId = reqJson.userId;
      const userIdUpdated = reqJson.userIdUpdated;
      const userName = reqJson.userName;

      const userInfo = await db.User.findOne({ where: { userId: userId } });
      await userInfo.update({
        userId: userIdUpdated,
        userName: userName
      });

      res.success = true;
      res.msg = 'Updated'
    } catch(e) {
      console.log(e)
      msg='Error'
    }
    return res;
  }

  async getUserInfo(userId) {
    let success = false;
    let msg = '';
    const data = {};
    try {
      const user = await db.User.findOne({ where: { userId: userId } });
      if( user ) {
        data.userId = await user.userId,
        data.userName = await user.userName,
        data.role = await user.role,
        data.approved = await user.approved
      }
      success = true;
      msg = 'success';
    } catch(e) {
      console.log(e);
      msg = 'Error';
    }
    return {success: success, msg: msg, data: data}
  }

  async getAllUsersInfo(reqUserId) {
    const res = {
      success: false,
      msg: '',
      data: {}
     }

    try {
      const reqUserRes = await this.getUserInfo(reqUserId)
      const reqUser = reqUserRes.data
      const reqUserRole  = await reqUser.role
      console.log('reqUserRole: ' + reqUserRole)
      if( reqUserRole != 'admin' ) {
        res.msg = 'Unauthorized'
        return res;
      }

      const users = []
      const usersDb = await db.User.findAll();
      usersDb.forEach((user) => {
        users.push({
          userId: user.userId,
          userName: user.userName,
          role: user.role,
          approved: user.approved
        })
      });
      res.data.users = users;
    } catch (e) {
      console.log(e)
      res.msg = 'Error'
    }

    return res
  }

  async createAdminUser() {
    let res = {success: false, msg: ''}
    try {
      const createdUser = await db.User.create({
        userId: 'nitishamraji9854',
        userName: 'Nitsh Amraji',
        approved: true,
        role: 'admin'
      });
      if( createdUser ) {
        res.success = true,
        res.msg = 'Created'
      }
    } catch(e) {
      console.log(e)
      res.msg = 'Error'
    }

    return res
  }

  async getUserWatchList(userId) {
    let res = {success: false, msg: '', data:[]}
    try {
      const userInfo = await db.User.findOne({ where: { userId: userId } });
      const userData = await userInfo.data;
      if( userData && userData.watchlist ) {
        res.data = userData.watchlist
      }
      res.success = true
    } catch (e) {
      console.log(e)
      res.msg='Error'
    }
    console.log('getUserWatchList: ' + JSON.stringify(res) )
    return res
  }

  async saveUserWatchList(reqJson) {
    let res = {success: false, msg: '', data:{}}

    try {

      const userInfo = await db.User.findOne({ where: { userId: reqJson.userId } });
      let userData = await userInfo.data;
      if( userData ) {
        userData.watchlist = reqJson.watchlist
      } else {
        userData = {watchlist: reqJson.watchlist}
      }

      await userInfo.setDataValue('data', userData);
      userInfo.changed('data', true);
      userInfo.save();

      res.success = true
      res.msg='Saved'
    } catch (e) {
      console.log(e)
      res.msg='Error'
    }

    return res
  }

  async updateToWatchList(userId, isAdd, symbol) {

    try {
      const userInfo = await db.User.findOne({ where: { userId: userId } });
      let userData = await userInfo.data;

      if( isAdd && ( !userData || !userData.watchlist ) ) {
        userData.watchlist = [symbol]
      } else {
        const dbWatchlist = userData.watchlist;
        if( isAdd ) {
          if( !dbWatchlist.includes(symbol) ) {
            dbWatchlist.push(symbol)
          }
        } else {
          if( dbWatchlist.includes(symbol) ) {
            dbWatchlist.splice(dbWatchlist.indexOf(symbol), 1);
          }
        }
      }

      await userInfo.setDataValue('data', userData);
      userInfo.changed('data', true);
      userInfo.save();

    } catch(e) {
      console.log(e)
    }
  }

  async setUserLastSeenMessageId(userId, msgId) {
    const userInfo = await db.User.findOne({ where: { userId: userId } });
    let userData = await userInfo.data;
    if( userData ) {
      userData.lastSeenMessageId = msgId;
    } else {
      userData = {lastSeenMessageId: msgId}
    }

    await userInfo.setDataValue('data', userData);
    userInfo.changed('data', true);
    userInfo.save();
  }

  async getUserLastSeenMessageId(userId) {
    const userInfo = await db.User.findOne({ where: { userId: userId } });
    let userData = await userInfo.data;
    if( userData && userData.lastSeenMessageId ) {
      return userData.lastSeenMessageId
    } else {
      return 0
    }
  }

}

module.exports = UserService;
