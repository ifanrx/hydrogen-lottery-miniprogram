import {TABLE_ID, CONTENT_GROUP} from '../config/constants'

export default {
  getRules() {
    let contentGroup = new wx.BaaS.ContentGroup(CONTENT_GROUP)
    return contentGroup.getContent(TABLE_ID.RULES_CONTENT)
  },
}