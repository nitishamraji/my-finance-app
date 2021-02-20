const moment = require('moment');
const db = require('../sequelize/models');
const UserService = require('./UserService')

class Messages {

  async addMessage(reqJson) {
    const res = {success: false, msg: ''}

    let returnMsg = '';
    const dbMessages = await db.Messages.findOne();

    const now = moment()
    const msgData = {
      message: reqJson.message,
      userId: reqJson.userId,
      createdAt: now,
      updatedAt: now
    }

    if( !msgData.message || msgData.message.length <= 0 ) {
      res.msg = 'Empty Message'
      return res;
    }

    if( !dbMessages ) {
      msgData.id = 1;
      const data = { messages: [msgData] }
      await db.Messages.create({data: data});
    } else {

      const dbMessagesData = await dbMessages.data;
      const messages = dbMessagesData.messages;

      let latestMessageId = 0;
      messages.forEach((message) => {
        latestMessageId = message.id && message.id > latestMessageId ? message.id : latestMessageId;
      });
      msgData.id = latestMessageId + 1;
      messages.push(msgData);

      await dbMessages.setDataValue('data', dbMessagesData);
      dbMessages.changed('data', true);
      dbMessages.save();
    }

    const userService = new UserService()
    userService.setUserLastSeenMessageId(reqJson.userId, msgData.id)

    res.success = true
    res.msg = 'Message added'

    return res
  }

  async getMessages(userId, isInternal) {
    let res = {success: false, msg: '', data: []}

    if( !isInternal ) {
      const userService = new UserService()
      const userInfo = await userService.getUserInfo(userId)

      if ( !userInfo.success ) {
        res.msg = 'Unauthorized'
        return res;
      }
    }

    const dbMessages = await db.Messages.findOne();
    if( dbMessages ) {
      let messages = dbMessages.data.messages;

      if( !messages )
        messages = []

      messages.forEach((message) => {
        message.dateFromNow = moment(message.createdAt).fromNow()
      });

      messages.sort(function(a,b){return moment(b.createdAt) - moment(a.createdAt)});

      res.data = messages;
      res.success = true;
    }

    return res;
  }

  async getLatestMessageId() {
    const messagesInfo = await this.getMessages(null, true)
    const messages = await messagesInfo.data

    if( !messages || messages.length <= 0 ) {
      return 0
    }
    messages.sort(function(a,b){return moment(b.id) - moment(a.id)});
    return messages[0].id
  }

  async updateUserLastSeenMessages(userId) {
    const latestMessageId = await this.getLatestMessageId()
    const userService = new UserService()
    userService.setUserLastSeenMessageId(userId, latestMessageId)
  }

  async getNumUnseenMessages(userId) {
    const userService = new UserService()
    const userLastSeenMessageId = await userService.getUserLastSeenMessageId(userId)

    const messagesInfo = await this.getMessages(null, true)
    const messages = await messagesInfo.data

    let numUnseenMessages = 0
    messages.forEach((messageInfo) => {
      if( messageInfo.id > userLastSeenMessageId ) {
        numUnseenMessages += 1;
      }
    });
    return numUnseenMessages;
  }

  async updateMessage(reqUserId, msgJson) {
    let res = {success: false, msg: ''}

    const userService = new UserService()
    const userInfo = await userService.getUserInfo(reqUserId)

    if (!userInfo.success || userInfo.data.userId !== msgJson.userId) {
      res.msg = 'Unauthorized'
      return res;
    }

    const dbMessages = await db.Messages.findOne();

    if( !dbMessages ){
      res.msg = 'Error'
      return res;
    }

    const messages = dbMessages.data.messages;
    messages.forEach((messageInfo) => {
      if ( messageInfo.id === msgJson.messageId )
        messageInfo.message = msgJson.message;
        messageInfo.updatedAt = moment()
    });

    dbMessages.changed('data', true);
    dbMessages.save();

    res.success = true;
    res.msg = 'Updated';

    return res;
  }

  async removeMessage(reqUserId, msgJson) {
    let res = {success: false, msg: ''}

    const userService = new UserService()
    const userInfo = await userService.getUserInfo(reqUserId)

    if (!userInfo.success || userInfo.data.userId !== msgJson.userId) {
      res.msg = 'Unauthorized'
      return res;
    }

    const dbMessages = await db.Messages.findOne();

    if( !dbMessages ){
      res.msg = 'Error'
      return res;
    }

    let messages = dbMessages.data.messages;
    const messagesToSave = [];

    messages.forEach((messageInfo) => {
      if ( messageInfo.id !== msgJson.messageId )
        messagesToSave.push(messageInfo)
    });

    dbMessages.data.messages = messagesToSave;

    dbMessages.changed('data', true);
    dbMessages.save();

    res.success = true;
    res.msg = 'Removed';

    return res;
  }

}

module.exports = Messages;
