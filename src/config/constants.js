const {NODE_ENV} = process.env
export const DEBUG = NODE_ENV !== 'production'
export const BAAS_CLIENT_ID = '' // client id
export const APP_ID = '' // app id

export const ROUTE = {
  INDEX: '/pages/index/index',
  LOTTERY_RESULT: '/pages/lotteryResult/lotteryResult',
  LOTTERY_DETAIL: '/pages/lotteryDetail/lotteryDetail',
  LOTTERY_WEBVIEW: '/pages/lotteryWebview/lotteryWebview',
  LOTTERY_RULES: '/pages/lotteryRules/lotteryRules',
  LOTTERY_CONTACT: '/pages/lotteryContact/lotteryContact',
}
// 活动规则内容库 id
export const CONTENT_GROUP = ''
// 测试数据表 id
const DEBUG_TABLE_ID = {
  'LOTTERY': '',
  'USER_LOTTERY_RECORD': '',
  'WORD_LIST': '',
  'RULES_CONTENT': '',
  'CONTACT_INFO': '',
}
// 线上数据表 id
const PROD_TABLE_ID = {
  'LOTTERY': '',
  'USER_LOTTERY_RECORD': '',
  'WORD_LIST': '',
  'RULES_CONTENT': '',
  'CONTACT_INFO': '',
}
// word list 表 record id
const PROD_WORD_LIST_ID = ''
const DEBUG_WORD_LIST_ID = ''

export const WECHAT_SCENE = {
  'FROM_CHAT': 'FROM_CHAT',
  'FROM_POSTER': 'FROM_POSTER',
  'FROM_DEFAULT': 'FROM_DEFAULT'
}

export const WECHAT_REPORT_ANALYTICS_MAP = {
  [WECHAT_SCENE.FROM_CHAT]: [
    ['ana_user_source', 'user_source', 'Link'],
    ['ana_user_source_link', 'link'],
    ['ana_user_source_share', 'share'],
  ],
  [WECHAT_SCENE.FROM_POSTER]: [
    ['ana_user_source', 'user_source', 'QR'],
    ['ana_user_source_qrcode', 'qrcode'],
    ['ana_user_source_share', 'share'],
  ],
  [WECHAT_SCENE.FROM_DEFAULT]: [
    ['ana_user_source', 'user_source', 'default'],
    ['ana_user_source_default', 'default'],
  ],
}

export const TABLE_ID = DEBUG ? DEBUG_TABLE_ID : PROD_TABLE_ID

export const WORD_LIST_ID = DEBUG ? DEBUG_WORD_LIST_ID : PROD_WORD_LIST_ID
