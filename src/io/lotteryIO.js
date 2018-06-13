import {TABLE_ID} from '../config/constants'

export default {
  /**
   * @desc 获取抽奖记录，根据抽奖期数进行倒序排序
   * @return {Promise}
   */
  getLottery() {
    let Lottery = new wx.BaaS.TableObject(TABLE_ID.LOTTERY)
    let query = new wx.BaaS.Query()
    return Lottery.setQuery(query).limit(1).orderBy('-lottery_ordinal').find()
  },
  getLotteryByOrdinal(ordinal = -1) {
    if (isNaN(ordinal) || ordinal < 0) {
      throw TypeError('ordinal invalid')
    }
    let Lottery = new wx.BaaS.TableObject(TABLE_ID.LOTTERY)
    let query = new wx.BaaS.Query()
    query.compare('lottery_ordinal', '=', ordinal)
    return Lottery.setQuery(query).find()
  },
  getLotteryById(id = '') {
    if (!id) {
      throw TypeError('id invalid')
    }
    let Lottery = new wx.BaaS.TableObject(TABLE_ID.LOTTERY)
    let query = new wx.BaaS.Query()
    query.compare('id', '=', id)
    return Lottery.setQuery(query).find()
  },
}