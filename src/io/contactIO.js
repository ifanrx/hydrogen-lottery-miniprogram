import { TABLE_ID } from '../config/constants'

export default {
  getContactInfoByUid(uid) {
    let contactInfoTable = new wx.BaaS.TableObject(TABLE_ID.CONTACT_INFO)
    let query = new wx.BaaS.Query()
    query.compare('created_by', '=', uid)
    return contactInfoTable.setQuery(query).find()
  },

  createContactInfo(data) {
    let contactInfoTable = new wx.BaaS.TableObject(TABLE_ID.CONTACT_INFO)
    let myContactInfoRecord = contactInfoTable.create()
    myContactInfoRecord.set(data)
    return myContactInfoRecord.save()
  },

  updateContactInfo(recordID, data) {
    let contactInfoTable = new wx.BaaS.TableObject(TABLE_ID.CONTACT_INFO)
    let myContactInfoRecord = contactInfoTable.getWithoutData(recordID)
    myContactInfoRecord.set(data)
    return myContactInfoRecord.update()
  },
}