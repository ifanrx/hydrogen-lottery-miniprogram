const {NODE_ENV} = process.env
export const DEBUG = NODE_ENV !== 'production'
export const BAAS_CLIENT_ID = '849144d9131d00651021'
export const APP_ID = 'wx335411651396fbdd'

export const ROUTE = {
  INDEX: '/pages/index/index',
  LOTTERY_RESULT: '/pages/lotteryResult/lotteryResult',
  LOTTERY_DETAIL: '/pages/lotteryDetail/lotteryDetail',
  LOTTERY_WEBVIEW: '/pages/lotteryWebview/lotteryWebview',
  LOTTERY_RULES: '/pages/lotteryRules/lotteryRules',
  LOTTERY_CONTACT: '/pages/lotteryContact/lotteryContact',
}
export const CONTENT_GROUP = '1528194988944866'
const DEBUG_TABLE_ID = {
  'LOTTERY': '38828',
  'USER_LOTTERY_RECORD': '38856',
  'WORD_LIST': '39698',
  'RULES_CONTENT': '1528195001879328',
  'CONTACT_INFO': '39584',
}
const PROD_TABLE_ID = {
  'LOTTERY': '38825',
  'USER_LOTTERY_RECORD': '38855',
  'WORD_LIST': '38836',
  'RULES_CONTENT': '1528195008970490',
  'CONTACT_INFO': '39583',
}
const PROD_WORD_LIST_ID = '5b1f60556020900a1c0ba83f'
const DEBUG_WORD_LIST_ID = '5b19f8985a79280ff5678af7'

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