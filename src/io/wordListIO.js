import {TABLE_ID, WORD_LIST_ID} from '../config/constants'

export default {
  getWordListData() {
    let WordList = new wx.BaaS.TableObject(TABLE_ID.WORD_LIST)
    let query = new wx.BaaS.Query()
    query.compare('id', '=', WORD_LIST_ID)
    return WordList.setQuery(query).limit(1).find()
  },
}