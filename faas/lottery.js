/*
* 抽奖
*/
const LOTTERY_TABLE = 38828 // 抽奖配置表
const USER_LOTTERY_RECORD_TABLE = 38856 // 用户参与抽奖记录表
const LOTTERY_RECORD = '5b10f4e926f1532268f96fa4' // 抽奖配置记录 id

let lotteryTable = new BaaS.TableObject(LOTTERY_TABLE)
let userLotteryRecordTable = new BaaS.TableObject(USER_LOTTERY_RECORD_TABLE)

// 在某次特定抽奖活动中未中奖的参与人里，找到中奖 offset 的参与人记录，并更新其为中奖状态
const updateLotteryRecord = (offset, lotteryID) => {
  let luckyQuery = new BaaS.Query()
  luckyQuery.compare('is_lucky', '=', false)
  luckyQuery.compare('lottery_id', '=', lotteryID)
  let luckyRecord = userLotteryRecordTable.limit(1).offset(offset).getWithoutData(luckyQuery)
  luckyRecord.set('is_lucky', true)
  return luckyRecord.update()
}

const draw = numberOfPeople => times => {
  let res = []
  for (let i = 0; i < times; i++) {
    const luckyOffset = Math.floor(Math.random() * numberOfPeople)
    res.sort((a, b) => {return a - b})
    /* 这里也可以构建一个长度为 numberOfPeople 的数组，
       每次随机选取一个 luckyOffset 后，将 luckyOffset 位置的值移出数组。
       这样保证了不会重复抽取，但是缺点是比较消耗内存。
       这里我们采取修正 luckyOffset 的方式，效率更高，两者实现的思路是一致的。
    */
    res.forEach(r => { if (r <= luckyOffset) luckyOffset += 1 })
    res.push(luckyOffset)
    numberOfPeople --
  }
  return res
}

exports.main = async function lottery(event, callback) {
  let lotteryData = await lotteryTable.get(LOTTERY_RECORD).catch(err => callback(err))
  const {lucky_limit, id: lotteryID, prize_name, prize_sponsor_name, lucky, active} = lotteryData.data

  if (lucky.length || !active) return callback(new Error('活动已经开奖'))

  let query = new BaaS.Query()
  query.compare('lottery_id', '=', lotteryID)
  let userLotteryRecords = await userLotteryRecordTable.setQuery(query).limit(1).find().catch(err => callback(err))

  const {total_count: total} = userLotteryRecords.data.meta

  let luckyOffsets = draw(total)(lucky_limit)

  for (let offset of luckyOffsets) {
    // luckyOffsets 代表的中奖者 offset 可能存在偏差，通过异步更新中奖数据消除该步骤产生的偏差
    await updateLotteryRecord(offset, lotteryID).catch(err => callback(err))
  }

  let luckyQuery = new BaaS.Query
  luckyQuery.compare('lottery_id', '=', lotteryID)
  luckyQuery.compare('is_lucky', '=', true)
  let resultRecords = await userLotteryRecordTable.setQuery(luckyQuery).find()
  const result = resultRecords.data.objects.map(obj => obj.created_by)

  let lotteryRecord = lotteryTable.getWithoutData(LOTTERY_RECORD)
  lotteryRecord.set('lucky', result)
  lotteryRecord.set('active', false)
  await lotteryRecord.update().catch(err => callback(err))

  // 发送模版消息
  let data = {
    recipient_type: 'user_profile',
    user_profile_filters: {
      lottery_id: {
        $regex: `^${lotteryID}$`,
        $options: ""
      }
    },
    template_id: "YcxF--NZvUX2K5ADEsxOyT2cCcbu-fgAM20M4tl3XkM",
    submission_type: "form_id",
    keywords: {
      keyword1: {
        value: prize_name,
        color: ""
      },
      keyword2: {
        value: `${prize_sponsor_name} 举办的抽奖正在开奖，点击查看中奖名单`,
        color: ""
      }
    },
    page: '/pages/index/index'
  }

  const templateMessageResult = await BaaS.sendTemplateMessage(data).catch(err => callback(err))
  if (templateMessageResult.data.status === 'ok') {
    callback(null, result)
  } else {
    callback(templateMessageResult.data)
  }
}
