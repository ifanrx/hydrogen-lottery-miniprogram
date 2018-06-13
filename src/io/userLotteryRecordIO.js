import { TABLE_ID } from '../config/constants'

export default {
  /**
   * @desc 获取指定某期已参与抽奖的好友 ID 集
   * @param: userId 用户ID  lotteryId 抽奖ID
   * @return {Promise}
   */
  findUserLottery(userId, lotteryID) {
    let UserLotteryRecord = new wx.BaaS.TableObject(TABLE_ID.USER_LOTTERY_RECORD)
    let query = new wx.BaaS.Query()
    query.compare('created_by', '=', userId)
    query.compare('lottery_id', '=', lotteryID)
    return UserLotteryRecord.setQuery(query).find()
  },
  findUserLotteryByUids(lotteryID,lucky = []) {
    let UserLotteryRecord = new wx.BaaS.TableObject(TABLE_ID.USER_LOTTERY_RECORD)
    let query = new wx.BaaS.Query()
    query.in('created_by', lucky)
    query.compare('lottery_id', '=', lotteryID)
    return UserLotteryRecord.setQuery(query).offset(0).limit(60).find()
  },
  create({ lotteryID = '', inviterUID = '', avatar, nickname }) {
    let UserLotteryRecord = new wx.BaaS.TableObject(TABLE_ID.USER_LOTTERY_RECORD)
    let record = UserLotteryRecord.create()
    record.set({
      lottery_id: lotteryID,
      inviter_uid: inviterUID,
      avatar,
      nickname,
    })
    return record.save()
  },
  getRankByFriendAcceptedInvitation(lotteryID, friendCount = 0) {
    if (!lotteryID) {
      throw new TypeError('`lotteryID` not valid')
    }
    let UserLotteryRecord = new wx.BaaS.TableObject(TABLE_ID.USER_LOTTERY_RECORD)
    let p1 = UserLotteryRecord.offset(0).limit(1).find()
    let query = new wx.BaaS.Query()
    query.compare('friend_accepted_invitation_count', '<', friendCount)
    let p2 = UserLotteryRecord.setQuery(query).offset(0).limit(1).find()
    return Promise.all([p1, p2]).then(values => {
      let totalCount = values[0].data.meta.total_count || 0
      let ltCount = values[1].data.meta.total_count || 0
      return totalCount > 0
        ? ltCount / totalCount
        : 0
    })
  },
  find({ lotteryID, offset = 0, limit = 1000 }) {
    let UserLotteryRecord = new wx.BaaS.TableObject(TABLE_ID.USER_LOTTERY_RECORD)
    let query = new wx.BaaS.Query()
    query.compare('lottery_id', '=', lotteryID)
    return UserLotteryRecord.setQuery(query).offset(offset).limit(limit).find()
  },
  getFriendAcceptedInvitationInDetail(uid, lotteryID) {
    return this.findUserLottery(uid, lotteryID).then(res => {
      const {friend_accepted_invitation} = res.data.objects[0]
      return this.findUserLotteryByUids(lotteryID, friend_accepted_invitation)
    })
  },
}