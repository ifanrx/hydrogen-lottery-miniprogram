/*
** @desc 当有用户创建 user_lottery_record 时触发，触发器条件为创建记录的 inviter_uid > 0, 即种子用户不会触发
*/

const TABLE_ID = {
  'USER_LOTTERY_RECORD': 38856,
  'LOTTERY': 38828,
}
const ERR_TYPE = {
  'GET_EMPTY_INVITER_RECORD': 'GET_EMPTY_INVITER_RECORD',
  'GET_INVITER_RECORD_FAILED': 'GET_INVITER_RECORD_FAILED',
  'GET_LOTTERY_FAILED': 'GET_LOTTERY_FAILED',
  'LOTTERY_NOT_ACTIVE': 'LOTTERY_NOT_ACTIVE',
  'GET_EMPTY_LOTTERY_RECORD': 'GET_EMPTY_LOTTERY_RECORD',
  'UPDATE_INVITER_RECORD_FAILED': 'UPDATE_INVITER_RECORD_FAILED',
  'INVITE_USER_SELF': 'INVITE_USER_SELF',
  'SEND_TPL_MSG_FAILED': 'SEND_TPL_MSG_FAILED',
  'NOT_EVENT_DATA': 'NOT_EVENT_DATA',
  'NO_INVITER': 'NO_INVITER'
}
const RESULT_TYPE = {
  'UPDATE_INVITER_SUCCESS': 'UPDATE_INVITER_SUCCESS',
  'SEND_TPL_MSG_SUCCESS': 'SEND_TPL_MSG_SUCCESS',
  'GET_LOTTERY_SUCCESS': 'GET_LOTTERY_SUCCESS',
}

let userLotteryTable = new BaaS.TableObject(TABLE_ID['USER_LOTTERY_RECORD'])

const getInviterRecord = eventData => {
  let query = new BaaS.Query()
  query.compare('lottery_id', '=', eventData.lottery_id)
  query.compare('created_by', '=', eventData.inviter_uid)
  return userLotteryTable.setQuery(query).find()
}

const updateInviterRecord = (recordID, eventData) => {
  let record = userLotteryTable.getWithoutData(recordID)
  record.uAppend('friend_accepted_invitation', eventData.created_by)
  record.incrementBy('friend_accepted_invitation_count', 1)
  return record.update()
}

const getLottery = (eventData) => {
  let table = new BaaS.TableObject(TABLE_ID['LOTTERY'])
  let query = new BaaS.Query()
  query.compare('id', '=', eventData.lottery_id)
  return table.setQuery(query).find()
}

const pushMsg = async function(lottery, eventData) {
  const fn = (n) => n > 9 ? `${n}` : `0${n}`
  let activityName = `${lottery.prize_name} 抽奖活动`
  let nickname = `${eventData.nickname}`
  let inviteDate = new Date(eventData.created_at * 1e3)
  let inviteDateStr = `${inviteDate.getFullYear()}年${fn(inviteDate.getMonth() + 1)}月${fn(inviteDate.getDate())}日 ${fn(inviteDate.getHours())}:${fn(inviteDate.getMinutes())}`
  let invitationTips = `${nickname} 成为了你邀请的第一个好友！`
  let note = `每个好友中奖, 你都可以获得 ¥90 优惠券`

  let tplData = {
    user_id: eventData.inviter_uid,
    template_id: "qBDWeKf2lNJD8xaFjmx9mD7ihJEIv__ZRetV-kAlZSU",
    submission_type: "form_id",
    keywords: {
      keyword1: {
        value: activityName,
      },
      keyword2: {
        value: nickname,
      },
      keyword3: {
        value: inviteDateStr
      },
      keyword4: {
        value: invitationTips
      },
      keyword5: {
        value: note
      },
    },
    page: `pages/index/index`,
  }

  return BaaS.sendTemplateMessage(tplData)
}

const sendTplMsg = async function(eventData, callback) {
  let lottery = await getLottery(eventData)
  let record = lottery.data.objects[0] || {}
  if (record.active) {
    let pushMsgRes = await pushMsg(record, eventData)
    if (pushMsgRes.data.status === 'ok') {
      callback(null, 'success')
    } else {
      callback(pushMsgRes.data)
    }
  } else {
    callback(null)
  }
}

exports.main = async function onUserLotteryRecordCreated(event, callback) {
  let eventData = event.data

  if (!eventData.created_at) return callback(ERR_TYPE.NOT_EVENT_DATA)

  // 不允许邀请自己，当用户通过直接 post 请求方式发送请求时可能出现
  if (eventData.created_by == eventData.inviter_uid) {
    return callback(ERR_TYPE.INVITE_USER_SELF)
  }

  let inviterRecord = await getInviterRecord(eventData)
  let inviter = inviterRecord.data.objects[0]
  if (inviter) {
    let updateRes = await updateInviterRecord(inviter.id, eventData)
    if (updateRes.data.friend_accepted_invitation.length == 1) {
      sendTplMsg(eventData, callback)
    } else {
      callback(null, RESULT_TYPE.UPDATE_INVITER_SUCCESS)
    }
  } else {
    callback(ERR_TYPE.GET_INVITER_RECORD_FAILED)
  }
}
