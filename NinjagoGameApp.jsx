import React, { useState, useEffect, useCallback, useRef } from 'react';
import pkg from './package.json';
const VERSION = pkg.version;

import { Maximize, Minimize, Volume2, Play, RotateCcw, Settings, Home, Plus, Trash2, Save, Info, Check, X, ChevronLeft, XCircle, Trophy, Lock, Unlock } from 'lucide-react';

// === 資料與常數準備 ===
const CHARACTERS = [
    { id: 'lloyd', name: '勞埃德', url: '/assets/medal_lloyd.png', colorClass: 'text-green-600', element: '❇️ 能量', skin: 'lloyd' },
    { id: 'jay', name: '阿光', url: '/assets/medal_jay.png', colorClass: 'text-blue-600', element: '⚡ 閃電', skin: 'jay' },
    { id: 'zane', name: '冰忍', url: '/assets/zane.png', colorClass: 'text-cyan-600', element: '❄️ 冰雪', skin: 'zane' },
    { id: 'kai', name: '赤地', url: '/assets/medal_kai.png', colorClass: 'text-red-600', element: '🔥 火焰', skin: 'kai' },
    { id: 'cole', name: '阿剛', url: '/assets/cole.png', colorClass: 'text-stone-800', element: '🪨 大地', skin: 'cole' },
    { id: 'nya', name: '赤蘭', url: '/assets/medal_nya.png', colorClass: 'text-sky-600', element: '💧 水', skin: 'nya' }
];

const VILLAIN_LEVEL_1 = { id: 'garmadon', name: '劇毒大師', url: '/assets/garmadon.png', colorClass: 'text-purple-600' };
const VILLAIN_LEVEL_2 = { id: 'overlord', name: '黑暗魔主', url: '/assets/overlord.png', colorClass: 'text-purple-900', isStrong: true };
const VILLAIN_LEVEL_3 = { id: 'pythor', name: '派索長老', url: '/assets/pythor.png', colorClass: 'text-white', isStrong: true };

const WORDS_LEVEL_1_2 = [
    '大人', '小人', '大哭', '大笑', '大口', '小口', '爸爸', '媽媽', '上天', '天上', '太大', '太小', '一天', '一月', '二天', '二月', '上上', '下下', '天地', '大地', '太陽', '月亮', '星星', '天亮', '大火', '大水', '火星', '水星', '三天', '三月', '下地', '地上', '地下', '土地', '大山', '小山', '土山', '石山', '火山', '土星', '木星', '好人', '田地', '水田', '我有', '我爸', '我媽', '我哭', '我笑', '好山', '好水'
];

const LEVEL_3_PRESETS = [

    { name: "第1關", words: ["人", "口", "大", "中", "小", "哭", "笑", "一", "上", "下", "爸", "媽", "大人", "小人", "大哭", "大笑", "大口", "小口"] },
    { name: "第2關", words: ["天", "太", "月", "二", "地", "陽", "亮", "星", "雲", "火", "水", "三", "爸爸", "媽媽", "上天", "天上", "太大", "太小", "一天", "一月", "二天", "二月", "上上", "下下"] },
    { name: "第3關", words: ["土", "山", "石", "木", "我", "好", "有", "田", "天地", "大地", "太陽", "月亮", "星星", "天亮", "大火", "大水", "火星", "水星", "三天", "三月", "下地", "地上", "地下"] },
    { name: "第4關", words: ["牛", "羊", "聰", "耳", "目", "心", "和", "四", "土地", "大山", "小山", "土山", "石山", "火山", "土星", "木星", "好人", "田地", "水田", "我有", "我爸", "我媽", "我哭", "我笑", "好山", "好水"] },
    { name: "第5關", words: ["明", "頭", "眉", "鼻", "手", "花", "樹", "五", "大牛", "小牛", "水牛", "山羊", "小羊", "小心", "中心", "心中", "四月", "四天"] },
    { name: "第6關", words: ["草", "葉", "日", "風", "雨", "的", "孩", "六", "聰明", "明亮", "明天", "明月", "眉頭", "鼻頭", "石頭", "木頭", "心頭", "小手", "小花", "大樹", "小樹", "樹木", "五月", "五天", "手心"] },
    { name: "第7關", words: ["白", "紅", "是", "家", "多", "唱", "子", "七", "花草", "小草", "草地", "樹葉", "一日", "大風", "大雨", "小雨", "下雨", "風雨", "雨水", "我的", "六月", "六日", "六天"] },
    { name: "第8關", words: ["愛", "爺", "奶", "少", "歌", "不", "朋", "八", "白雲", "白天", "明白", "紅花", "紅日", "火紅", "火花", "是的", "我是", "大家", "我家", "人家", "孩子", "鼻子", "葉子", "七月", "七日", "七天", "紅太陽"] },
    { name: "第9關", words: ["寶", "在", "學", "書", "游", "友", "幾", "九", "爺爺", "奶奶", "多少", "唱歌", "愛笑", "愛哭", "愛唱", "不愛", "不哭", "不笑", "不唱", "不是", "是不是", "好不好", "不好", "八月", "八日", "八天"] },
    { name: "第10關", words: ["貝", "生", "習", "看", "戲", "字", "氣", "十", "寶寶", "在家", "不在", "小人書", "游水", "朋友", "友人", "花兒", "兒子", "歌兒", "兒歌", "九月", "九日", "九天"] },
    { name: "第11關", words: ["會", "見", "早", "雪", "雞", "綠", "黃", "青", "魚", "做", "飛", "跑", "要", "吃", "鳥", "他", "看見", "會見", "學會", "早上", "大雪", "小雪", "雪花", "白雪", "雪人", "雪山", "雪地", "下雪天", "小雞", "大雞", "綠草", "綠葉", "黃花", "黃牛", "青草", "小魚", "飛鳥", "飛跑", "飛人", "不要", "不吃", "愛吃", "小鳥", "黃鳥", "做遊戲", "要不要"] },
    { name: "第12關", words: ["們", "春", "夏", "秋", "冬", "季", "都", "我們", "他們", "人們", "孩子們", "朋友們", "學生們", "春季", "春天", "春風", "春雨", "夏季", "夏天", "三個人", "都不是", "秋季", "秋天", "秋風", "冬季", "冬天", "四季", "都是"] },
    { name: "第13關", words: ["狗", "貓", "藍", "落", "真", "開", "說", "也", "大狗", "小狗", "黃狗", "黑狗", "大貓", "小貓", "花貓", "白貓", "藍天", "藍貓", "落下", "落葉", "真是", "真的", "真心", "天真", "開心", "開會", "開花", "開門", "也要", "也是", "也不要", "也不好", "也不職"] },
    { name: "第14關", words: ["馬", "米", "哥", "姐", "來", "黑", "去", "出", "大馬", "小馬", "白馬", "黑馬", "大米", "小米", "白米", "黑米", "哥哥", "大哥", "姐姐", "大姐", "小姐", "黑天", "天黑", "出來", "出去"] },
    { name: "第15關", words: ["跳", "着", "了", "你", "又", "弟", "妹", "東", "跳着", "看着", "吃着", "說着", "來了", "去了", "吃了", "你們", "又要", "又去", "又哭", "又說", "又笑", "弟弟", "小弟", "姐妹", "妹妹", "小妹"] },
    { name: "第16關", words: ["就", "還", "快", "得", "西", "樂", "到", "起", "就是", "還是", "還有", "得了", "得到", "來到", "去到", "到了", "東西", "東風", "快樂", "起來", "一起"] },
    { name: "第17關", words: ["玩", "捉", "迷", "球", "很", "高", "鴨", "哈", "遊玩", "玩球", "玩水", "玩遊戲", "大球", "氣球", "很好", "很大", "很小", "高大", "高山", "高個子", "跳高", "小鴨子", "哈哈笑"] },
    { name: "第18關", words: ["方", "爬", "藏", "興", "向", "對", "能", "叫", "地方", "上方", "爬山", "爬樹", "高興", "方向", "向着", "捉迷藏", "對着", "對了", "不對", "對不對", "大叫", "叫着", "不能", "對不起", "能不能"] },
    { name: "第19關", words: ["變", "問", "成", "再", "急", "教", "門", "只", "變了", "不變", "變成", "問好", "問人", "再見", "再說", "再去", "再來", "急得", "着急", "大門", "開門", "門口", "一隻", "三隻", "一聲"] },
    { name: "第20關", words: ["回", "公", "打", "兔", "請", "過", "嗎", "泳", "回家", "回來", "回去", "回頭", "公公", "公雞", "打人", "白兔", "兔子", "過來", "過去", "來過", "去過", "好嗎", "去嗎", "來嗎", "游泳", "很高興", "真快樂", "好開心", "好得很", "對不起", "笑哈哈", "一會兒"] },
    { name: "第21關", words: ["蟲", "把", "騎", "鵝", "河", "禮", "背", "拿", "裏", "後", "謝", "邊", "貌", "班", "幼", "園", "蟲子", "一把", "把手", "把門", "把戲", "騎着", "天鵝", "白鵝", "小河", "大河", "河水", "黃河", "河馬", "禮花", "背心", "背上", "手背", "拿着", "拿來", "拿去", "家裏", "裏頭", "手裏", "心裏", "後天", "後來", "後頭", "後門", "後背", "謝謝", "禮貌", "後邊", "裏邊", "東邊", "西邊", "河邊", "大班", "中班", "小班", "上班", "下班", "幼兒", "幼稚園", "幼小", "幼蟲", "公園", "花園"] },
    { name: "第22關", words: ["照", "婆", "甜", "夢", "老", "盒", "尺", "刀", "照着", "照看", "照明", "甜的", "甜水", "做夢", "夢見", "夢遊", "老人", "老家", "盒子", "尺子", "刀子", "小刀", "老人家", "老爺爺", "老奶奶", "老公公", "老婆婆"] },
    { name: "第23關", words: ["時", "正", "文", "具", "筆", "畫", "長", "放", "小時", "正在", "正是", "正好", "中文", "文字", "文人", "文明", "文學", "文具", "文具盒", "玩具", "家具", "畫畫", "家家", "畫筆", "筆頭", "長大", "長高", "生長", "成長", "放着", "放開", "放大", "放火", "放心", "放學", "放牛", "放羊", "放馬", "放手"] },
    { name: "第24關", words: ["用", "總", "尾", "巴", "玉", "尖", "竹", "苗", "有用", "不用", "用來", "用心", "用做", "總是", "尾巴", "巴不得", "哈巴狗", "玉米", "玉石", "玉兔", "寶玉", "尖的", "尖刀", "刀尖", "筆尖", "尖子", "竹子", "竹馬", "竹葉", "小苗", "竹苗", "苗兒", "青苗", "綠苗", "苗子"] },
    { name: "第25關", words: ["聽", "話", "猴", "猩", "給", "進", "告", "電", "聽話", "小猴子", "小猩猩", "交給", "進門", "告訴", "電話"] },
    { name: "第26關", words: ["片", "吹", "澆", "燕", "睡", "醒", "蛙", "呱", "南", "椅", "坐", "身", "吧", "桌", "布", "抱", "一片", "吹風", "吹氣", "吹牛", "澆水", "澆花", "澆地", "燕子", "睡醒", "睡夢", "早睡", "早起", "醒了", "醒來", "青蛙", "牛蛙", "呱呱叫", "南邊", "南方", "南面", "南風", "椅子", "請坐", "坐下", "坐着", "身子", "身上", "身高", "身邊", "來吧", "去吧", "好吧", "吃吧", "桌子", "書桌", "方桌", "桌椅", "花布", "桌布", "抱着", "抱起"] },
    { name: "第27關", words: ["摔", "聲", "誰", "呢", "認", "原", "痛", "喊", "摔東西", "摔了", "摔打", "大聲", "小聲", "歌聲", "笑聲", "風聲", "雨聲", "哭聲", "讀書聲", "是誰", "誰的", "誰呀", "認字", "認得", "認真", "認為", "草原", "高原", "原來", "好痛", "心痛", "痛哭", "痛快", "頭痛", "喊叫", "大喊", "喊人", "喊着", "喊聲"] },
    { name: "第28關", words: ["狼", "啦", "趕", "救", "假", "掉", "路", "碰", "大灰狼", "狼狗", "來啦", "走啦", "去啦", "吃啦", "快啦", "好啦", "趕快", "趕路", "趕車", "趕不上", "趕得上", "趕走", "趕着", "救人", "救火", "救星", "假的", "真假", "假話", "假山", "掉了", "掉東西", "掉到", "吃掉", "走掉", "跑掉", "掉頭", "掉車", "大路", "馬路", "公路", "路上", "路人", "路口", "路面", "碰見", "碰上", "碰到", "碰頭"] },
    { name: "第29關", words: ["哪", "呀", "兩", "逃", "走", "她", "點", "音", "哪裏", "哪個", "哪兒", "來呀", "去呀", "吃呀", "好呀", "走呀", "兩個", "兩邊", "四兩", "逃走", "逃跑", "逃學", "逃掉", "走路", "走好", "走到", "走來走去", "快走", "她的", "給她", "她們", "一點", "十點", "點心", "點名", "點頭", "點火", "點子", "快點", "高點", "聲音", "高音", "口音", "音樂"] },
    { name: "第30關", words: ["可", "伸", "縫", "央", "根", "棍", "丟", "灰", "可是", "可用", "伸出", "伸手", "門縫", "小縫", "夾縫", "縫子", "夾子", "夾住", "夾起來", "一根", "草根", "樹根", "根苗", "根子", "棍子", "木棍", "丟了", "丟掉", "丟人", "大灰狼", "灰白", "白灰", "灰心"] },
    { name: "第31關", words: ["蘿", "蔔", "熟", "拔", "拉", "鼠", "咕", "咚", "蘿蔔", "熟了", "成熟", "背熟了", "拔出來", "拔草", "拔起", "拔河", "拉手", "拉着", "拉住", "拉走", "拉來", "老鼠", "田鼠", "咕咚"] },
    { name: "第32關", words: ["倒", "抬", "晚", "左", "右", "怎", "麼", "辦", "倒了", "倒下", "摔倒", "倒車", "抬着", "抬頭", "抬起", "抬走", "晚上", "明晚", "晩了", "左手", "左邊", "左面", "左右", "右手", "右邊", "右面", "怎麼", "辦公", "怎麼了", "怎麼辦"] },
    { name: "第33關", words: ["知", "道", "午", "這", "座", "洞", "甚", "害", "知道", "不知道", "知心", "道路", "道謝", "上午", "中午", "下午", "午飯", "午睡", "午前", "午後", "這個", "這裏", "這兒", "這邊", "這樣", "這麼", "一座山", "山洞", "洞子", "洞口", "甚麼", "害怕", "害蟲", "害鳥", "蟲害", "害人"] },
    { name: "第34關", words: ["付", "頂", "角", "死", "撲", "期", "帶", "分", "對付", "付給", "付出", "頭頂", "頂着", "頂快", "頂大", "頂好", "頂用", "頂風", "頂牛", "頂頭", "一頂", "牛角", "羊角", "鹿角", "尖角", "三角", "口角", "角落", "死了", "死掉", "死人", "打死", "死路", "死心", "笑死了", "高興死了", "死心眼", "撲上去", "撲向前", "撲救", "日期", "星期", "學期", "定期", "長期", "分期", "到期", "帶着", "帶子", "帶上", "帶動", "帶魚", "帶路", "分開", "分工", "分家", "分手", "分心"] },
    { name: "第35關", words: ["清", "今", "昨", "光", "陽", "錯", "指", "拇", "清早", "清醒", "清風", "清水", "清香", "分清", "今天", "今日", "今年", "今後", "昨天", "昨日", "陽光", "日光", "月光", "星光", "光明", "光頭", "光亮", "眼光", "亮光", "火光", "光陰", "陰天", "陰雲", "陰雨", "錯了", "大錯", "小錯", "過錯", "錯字", "認錯", "錯過", "手指", "指頭", "拇指", "中指", "小指", "指尖", "指着", "指向"] },
    { name: "第36關", words: ["食", "無", "名", "加", "共", "事", "幫", "餓", "肚", "獅", "覺", "毛", "求", "等", "香", "肉", "冷食", "甜食", "食指", "中指", "無名指", "無風", "無邊", "無能", "無心", "名字", "名人", "名山", "加上", "加班", "一共", "共同", "共有", "公共", "做事", "大 事", "小事", "好事", "事後", "有事", "幫我", "幫你", "幫他", "幫手", "幫工"] },
    { name: "第37關", words: ["摔", "網", "咬", "力", "啊", "牙", "嘴", "漂", "肚子", "餓了", "肚子餓", "獅子", "獅子狗", "睡覺", "毛筆", "毛蟲", "毛毛", "毛毛蟲", "毛毛雨", "求求你", "要求", "請求", "求人", "醒來", "求救"] },
    { name: "第38關", words: ["胡", "虎", "貼", "才", "數", "更", "朵", "紙", "一張", "張口", "張大", "大網", "網子", "漁網", "上網", "毛蟲", "咬人", "不咬", "咬牙", "咬東西", "用力", "力氣", "大力水手", "來啊", "走啊", "吃啊"] },
    { name: "第39關", words: ["圓", "圈", "親", "臉", "眼", "更", "接", "外", "鬍子", "胡說", "胡來", "胡說八道", "胡同", "老虎", "虎口", "虎牙", "貼着", "貼上", "貼心", "人才", "天才", "才氣", "才能", "數字", "數目", "數學", "數一數", "數一數二"] },
    { name: "第40關", words: ["笨", "以", "自", "己", "慢", "難", "練", "每", "數落", "更好", "更大", "更小", "更多", "更少", "更長", "更冷", "更黑", "更新", "更加", "更正", "變更", "花朵", "雲朵", "朵朵", "耳朵", "一張紙", "白紙", "紅紙", "黃紙", "紙張", "紙盒"] },
    { name: "第41關", words: ["顆", "樣", "因", "為", "離", "近", "象", "船", "很笨", "笨人", "笨孩子", "可以", "以前", "以後", "以上", "以下", "以為", "所以", "自來水", "自動", "自從", "自學", "自己", "快慢", "慢慢", "慢走", "慢跑", "慢點", "太慢了"] },
    { name: "第42關", words: ["閃", "金", "美", "麗", "當", "扇", "滿", "幹", "一顆", "一樣", "同樣", "樣子", "怎麼樣", "因為", "原因", "因果", "成為", "作為", "熟練", "為甚麼", "為了", "離開", "離去", "分離"] },
    { name: "第43關", words: ["朝", "熊", "娃", "汽", "車", "北", "京", "往", "嗚", "很近", "近日", "近來", "接近", "親近", "大象", "象牙", "氣象", "景象", "象棋", "印象", "小船", "大船", "船槳", "飛船", "太空船", "船頭", "船尾"] },
    { name: "第44關", words: ["鹿", "森", "林", "採", "蘑", "菇", "籃", "直", "朝着", "朝向", "熊貓", "狗熊", "白熊", "黑熊", "娃娃", "娃娃魚", "汽水", "汽車", "汽船", "小船", "火車", "電車", "馬車", "水車", "開車", "車子", "車門", "北京", "東北", "西北", "北邊", "北方", "南京", "京戲", "開往", "來往", "往往", "往年", "往日", "往事", "往後", "往哪裏", "嗚嗚叫"] },
    { name: "第45關", words: ["摸", "苔", "所", "科", "燈", "應", "該", "題", "摸到", "摸出", "摸魚", "摸一摸", "青苔", "住所", "所以", "所有", "兩所", "科學", "科學家", "小兒科", "外科", "開燈", "關燈", "紅燈", "綠燈", "黃燈", "日光燈", "燈光", "燈火", "燈泡", "應當", "應該", "不應該", "應有", "出題", "問題", "題目", "題字", "題名"] },
    { name: "第46關", words: ["停", "而", "窗", "剛", "撞", "比", "記", "串", "停車", "停放", "停工", "停火", "停水", "停學", "停住", "停不停", "不停", "停了", "而今", "窗洞", "窗口", "窗子", "窗花", "天窗", "開窗", "關窗", "門窗", "剛才", "剛剛", "剛好", "剛正", "剛來", "剛走", "剛停", "撞車", "撞見", "撞上", "比一比", "記得", "不記得", "記不清", "日記", "筆記", "遊記", "一串串", "串門"] },
    { name: "第47關", words: ["湖", "棵", "瓜", "透", "腿", "狐", "粗", "竿", "狸", "跟", "被子", "被告", "夠不夠", "不夠", "能夠", "不夠高", "夠朋友", "碰到", "碰不到", "人命", "生命", "救命", "長頸鹿", "一定", "不一定", "定時", "定期", "坐定", "定心", "嚇人", "啄米", "啄食", "啄破", "啄木鳥", "破了", "破開"] },
    { name: "第48關", words: ["釣", "甩", "鉤", "忘", "裝", "餌", "算", "桶", "壞", "忙", "湖水", "一棵", "兩棵", "冬瓜", "南瓜", "黃瓜", "木瓜", "瓜分", "透風", "透雨", "透亮", "透明", "看透", "透過", "大腿", "小腿", "狗腿", "狐狸", "狸貓", "跟前", "跟着", "跟頭", "粗心", "粗細", "竹竿"] },
    { name: "第49關", words: ["洗", "忽", "然", "全", "條", "怪", "物", "豬", "影", "信", "釣魚", "甩手", "甩開", "甩出", "甩去", "甩掉", "魚鉤", "鉤子", "忘掉", "忘記", "忘我", "西裝", "安裝", "裝好", "魚餌", "釣餌", "算了", "算數", "算題", "水桶", "木桶", "壞了", "壞人", "壞事", "氣壞了", "樂壞了", "很忙", "急忙", "忙着"] },
    { name: "第50關", words: ["呼", "結", "冰", "枝", "發", "抖", "暖", "屋", "法", "件", "於", "洗手", "洗臉", "清洗", "忽然", "然後", "全身", "全家", "全班", "全力", "全面", "一條路", "兩條魚", "條子", "柳條", "怪人", "怪物", "怪樣", "怪不得", "動物", "生物", "大豬", "小豬", "影子", "倒影", "電影", "來信", "去信", "寫信", "信不信", "信心"] },
    { name: "第51關", words: ["松", "帽", "戴", "熱", "候", "勞", "流", "汗", "涼", "別", "呼叫", "呼喊", "呼聲", "呼氣", "結子", "結冰", "結果", "結尾", "冰雪", "冰花", "冰冷", "冰水", "冰山", "樹枝", "枝條", "發生", "發電", "發水", "發火", "發亮", "發出", "發明", "頭髮", "出發", "發給", "發抖", "抖動", "抖掉", "冷暖", "暖和", "暖水瓶", "裏屋", "外屋", "屋子", "屋頂", "辦法", "方法", "法寶", "法國", "一件", "兩件", "文件", "急件", "於是", "對於"] },
    { name: "第52關", words: ["整", "還", "覺", "蓋", "憐", "窩", "着", "病", "受", "羽", "望", "松樹", "松子", "松鼠", "鬆口", "鬆手", "放鬆", "輕鬆", "帽子", "草帽", "太陽帽", "戴上", "戴帽子", "熱帶魚", "熱天", "很熱", "熱了", "熱水", "熱愛", "熱心", "火熱", "冷熱", "問候", "等候", "候鳥", "時候", "勞動", "涼水", "涼快", "冰涼", "清涼", "別人", "別的", "個別", "別給", "別走", "別哭", "別說話", "告別"] },
    { name: "第53關", words: ["騎", "行", "遠", "經", "旁", "嬸", "呵", "稀", "奇", "整個", "整理", "還給", "還書", "還手", "還東西", "送還", "覺得", "蓋子", "蓋着", "可憐", "憐愛", "鳥窩", "心窩", "窩頭", "着急", "着火", "睡著了", "病人", "生病", "看病", "病倒", "大病", "小病", "受害", "受到", "難受", "接受", "羽毛", "望着", "望見", "看望"] },
    { name: "第54關", words: ["祝", "賀", "腦", "呆", "牀", "鬧", "鐘", "撥", "準", "備", "騎車", "騎自行車", "騎馬", "行人", "人行道", "行走", "遠近", "很遠", "走遠", "遠方", "出遠門", "經過", "一旁", "旁邊", "旁人", "路旁", "旁聽", "大嬸", "嫂子", "笑呵呵", "樂呵呵", "稀奇", "稀少", "稀飯", "奇怪"] },
    { name: "第55關", words: ["其", "實", "輕", "響", "遲", "已", "叠", "包", "碗", "寫", "冒", "您", "祝賀", "賀信", "賀電", "賀禮", "腦子", "頭腦", "大腦", "右腦", "左腦", "小腦", "發呆", "呆呆地", "呆頭呆腦", "起牀", "小牀", "打鬧", "熱鬧", "鬧鐘", "看鐘", "打鐘", "鐘點", "撥動", "準時", "準備", "準是"] }
];

// === 地圖世界定義 (5個章節) ===
const MAP_WORLDS = [
    {
        id: 0, name: '忍者啟程', subtitle: '第 1-11 關', emoji: '🌱', 
        description: '在山中神廟接受基礎訓練，掌握忍者的基本本領。', heroId: 'lloyd',
        bg: '/assets/world_bg_1.png', medal: '/assets/medal_lloyd.png',
        overlayColor: 'from-green-600/30 to-slate-950/90',
        borderColor: 'border-green-500', glowColor: 'shadow-green-500/30',
        levels: LEVEL_3_PRESETS.slice(0, 11)
    },
    {
        id: 1, name: '隱密訓練', subtitle: '第 12-22 關', emoji: '⛰️',
        description: '進入高峻的山脈，學會在極端環境下隱藏行蹤與作戰。', heroId: 'jay',
        bg: '/assets/world_bg_2.png', medal: '/assets/medal_jay.png',
        overlayColor: 'from-blue-600/30 to-slate-950/90',
        borderColor: 'border-blue-500', glowColor: 'shadow-blue-500/30',
        levels: LEVEL_3_PRESETS.slice(11, 22)
    },
    {
        id: 2, name: '黑暗崛起', subtitle: '第 23-33 關', emoji: '🔥',
        description: '黑暗要塞的勢力正在擴張，忍者必須深入虎虎穴迎接挑戰。', heroId: 'kai',
        bg: '/assets/world_bg_3.png', medal: '/assets/medal_kai.png',
        overlayColor: 'from-red-600/30 to-slate-950/90',
        borderColor: 'border-red-500', glowColor: 'shadow-red-500/30',
        levels: LEVEL_3_PRESETS.slice(22, 33)
    },
    {
        id: 3, name: '終極考驗', subtitle: '第 34-44 關', emoji: '⚡',
        description: '面對黑暗魔術的最強考驗，只有意志堅定者才能勝出。', heroId: 'cole',
        bg: '/assets/world_bg_4.png', medal: '/assets/medal_cole.png',
        overlayColor: 'from-orange-600/30 to-slate-950/90',
        borderColor: 'border-orange-500', glowColor: 'shadow-orange-500/30',
        levels: LEVEL_3_PRESETS.slice(33, 44)
    },
    {
        id: 4, name: '傳説忍者', subtitle: '第 45-55 關', emoji: '✨',
        description: '覺醒終極潛能，成為守護世界的傳說忍者。', heroId: 'nya',
        bg: '/assets/world_bg_5.png', medal: '/assets/medal_nya.png',
        overlayColor: 'from-purple-600/30 to-slate-950/90',
        borderColor: 'border-purple-400', glowColor: 'shadow-purple-400/30',
        levels: LEVEL_3_PRESETS.slice(44, 55)
    }
];

// === 產生單一章節地香圖節點 (Zigzag進適單個视區內) ===
const generateChapterNodes = (levels) => {
    const cols = [250, 500, 750]; // Centered 3-column layout
    const rowHeight = 160;        // Increased vertical spacing
    const startY = 150;           // Top margin
    return levels.map((level, idx) => {
        const rowIndex = Math.floor(idx / 3);
        const posInRow = idx % 3;
        // Zigzag: L->R then R->L
        const colX = rowIndex % 2 === 0 
            ? cols[posInRow] 
            : cols[2 - posInRow];
        const y = startY + rowIndex * rowHeight;
        return { ...level, x: colX, y, id: idx };
    });
};

// Keep MAP_NODES for backward compat with non-map references
const MAP_NODES = LEVEL_3_PRESETS.map((preset, idx) => ({ ...preset, id: idx }));

const DEFAULT_MAP_OFFSET = { x: 0, y: 0 };

const WORDS_LEVEL_3_ALL = LEVEL_3_PRESETS.flatMap(p => p.words);

// 陣列發牌洗牌器
const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// === 進度條主題配置 ===
const BAR_THEMES = [
    { id: 'energy', color: 'bg-gradient-to-r from-green-400 to-green-600', glow: '0 0 20px rgba(74, 222, 128, 0.6)', trail: '❇️', particle: 'bg-green-400', anim: 'glow-pulse' },
    { id: 'lightning', color: 'bg-gradient-to-r from-blue-400 to-yellow-300', glow: '0 0 20px rgba(96, 165, 250, 0.8)', trail: '⚡', particle: 'bg-blue-300', anim: 'lightning-bolt' },
    { id: 'ice', color: 'bg-gradient-to-r from-cyan-100 to-blue-300', glow: '0 0 20px rgba(165, 243, 252, 0.7)', trail: '❄️', particle: 'bg-white', anim: 'frost-shimmer' },
    { id: 'fire', color: 'bg-gradient-to-r from-orange-500 to-red-600', glow: '0 0 25px rgba(239, 68, 68, 0.7)', trail: '🔥', particle: 'bg-orange-500', anim: 'flame-flicker' },
    { id: 'earth', color: 'bg-gradient-to-r from-stone-600 to-stone-800', glow: '0 0 15px rgba(120, 113, 108, 0.5)', trail: '🪨', particle: 'bg-stone-500', anim: 'earth-rumble' },
    { id: 'water', color: 'bg-gradient-to-r from-sky-400 to-blue-600', glow: '0 0 20px rgba(14, 165, 233, 0.6)', trail: '💧', particle: 'bg-sky-200', anim: 'water-wave' },
    { id: 'shadow', color: 'bg-gradient-to-r from-purple-800 to-black', glow: '0 0 30px rgba(88, 28, 135, 0.8)', trail: '🟣', particle: 'bg-purple-600', anim: 'shadow-mist' }
];

// === 輔助元件 ===
const BattleHeader = ({ heroEnergy, villain, progress, heroSkin, isStaggered, isHeroAttacking }) => {
    const heroInfo = CHARACTERS.find(c => c.skin === heroSkin) || CHARACTERS[3];
    
    return (
        <div className="w-full bg-slate-900/90 px-4 md:px-8 py-4 rounded-3xl border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] mb-2 relative overflow-visible scale-90 md:scale-100 origin-top">
            {/* 戰鬥抬頭：雙方血條 */}
            <div className="flex justify-between gap-4 md:gap-12 mb-4">
                {/* 英雄血條 (左) */}
                <div className="flex-1">
                    <div className="flex justify-between mb-2">
                        <span className="text-yellow-400 font-bold uppercase">{heroInfo.name} ENERGY</span>
                        <span className="text-white font-mono">{heroEnergy}%</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            style={{ width: `${heroEnergy}%` }}
                        ></div>
                    </div>
                </div>
                {/* 閃電中心圖示 */}
                <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse border-2 border-white">
                        <span className="text-white font-black">VS</span>
                    </div>
                </div>
                {/* 壞人血條 (右) */}
                <div className="flex-1">
                    <div className="flex justify-between mb-2">
                        <span className="text-red-500 font-bold uppercase">{villain.name}</span>
                        <span className="text-white font-mono">{Math.max(0, Math.round(100 - progress))}%</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                            style={{ width: `${100 - progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 戰鬥對決場景 */}
            <div className="relative h-32 md:h-48 flex items-center justify-between px-12 md:px-24">
                {/* 背景裝飾：閃電對沖 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-white to-red-500 animate-pulse"></div>
                </div>

                {/* 英雄 (左側) */}
                <div className={`relative z-20 ${isHeroAttacking ? 'battle-hero-attack' : isStaggered ? 'battle-hero-hit' : ''}`}>
                    <div className="w-16 h-16 md:w-32 md:h-32 bg-white rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] overflow-hidden">
                        <img src={heroInfo.url} alt="Player" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-2 -left-2 bg-yellow-500 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black animate-bounce">LV.Max</div>
                    {isHeroAttacking && (
                        <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 text-6xl animate-ping">💥</div>
                    )}
                </div>

                {/* 壞人 (右側) */}
                <div className={`relative z-10 ${isStaggered ? 'battle-villain-attack' : isHeroAttacking ? 'battle-villain-hit' : ''}`}>
                    <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full border-6 ${villain.isStrong ? 'border-red-700' : 'border-purple-600'} bg-slate-900 overflow-hidden flex items-center justify-center shadow-2xl`}>
                        <img src={villain.url} alt={villain.name} className="w-full h-full object-cover" />
                    </div>
                    {isStaggered && (
                        <div className="absolute top-1/2 right-full -translate-y-1/2 mr-4 text-6xl animate-ping">💢</div>
                    )}
                </div>
            </div>

            <div className="mt-4 text-center text-white/50 animate-pulse text-xs tracking-widest uppercase">
                決勝負！答對題目攻擊對手
            </div>
        </div>
    );
};

// === 元件：動態進度條 ===
const ProgressBar = ({ score, target = 10, heroEnergy = 100, themeIndex = 0, isStaggered = false, villain, isBattleMode = false, isHeroAttacking = false, heroSkin }) => {
    const theme = BAR_THEMES[themeIndex % BAR_THEMES.length];
    const progress = (score / target) * 100;

    if (isBattleMode) {
        return (
            <BattleHeader 
                heroEnergy={heroEnergy} 
                villain={villain} 
                progress={progress} 
                heroSkin={heroSkin}
                isStaggered={isStaggered}
                isHeroAttacking={isHeroAttacking}
            />
        );
    }

    return (
        <div className="w-full bg-slate-800/80 px-4 md:px-8 py-4 rounded-3xl border-4 border-slate-600 shadow-2xl mb-2 relative overflow-visible">
            {/* 進度條背景軌道 */}
            <div className="w-full h-8 bg-slate-900 rounded-full mb-8 relative border-2 border-slate-700 shadow-inner overflow-hidden">
                {/* 填充進度 */}
                <div
                    className={`absolute top-0 left-0 h-full ${theme.color} rounded-full transition-all duration-700 ease-out ${theme.anim}`}
                    style={{ width: `${progress}%`, boxShadow: theme.glow }}
                >
                    {/* 內部流光效果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 w-20 h-full animate-[shimmer_2s_infinite]" />
                </div>

                {/* 輔助裝飾：主題粒子 */}
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full opacity-50 ${theme.particle} animate-ping`}
                        style={{
                            width: '8px', height: '8px',
                            left: `${progress - (Math.random() * 5)}%`,
                            top: `${Math.random() * 100}%`,
                            display: progress > 0 ? 'block' : 'none',
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
            </div>

            {/* 玩家與敵人頭像疊層 (在軌道上方) */}
            <div className="absolute top-[40px] left-0 w-[calc(100%-64px)] mx-4 md:mx-8 pointer-events-none">
                {/* 我方頭像 */}
                <div
                    className={`absolute bottom-0 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full border-4 shadow-xl z-20 overflow-hidden ${isStaggered ? 'player-stagger' : 'transition-[left] duration-700 ease-out'}`}
                    style={{ 
                        left: `calc(${progress}% - 32px)`,
                        borderColor: theme.id === 'shadow' ? '#7e22ce' : '#facc15',
                        boxShadow: `0 0 20px ${theme.id === 'shadow' ? 'rgba(126,34,206,0.6)' : 'rgba(250,204,21,0.6)'}`
                    }}
                >
                    <img src="/assets/player.jpg" alt="Player" className="w-full h-full object-cover" />
                    {/* 主題圖示跟隨 */}
                    <div className="absolute bottom-0 right-0 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm">
                        {theme.trail}
                    </div>
                </div>

                {/* 敵人頭像 (固定在右端) */}
                <div className={`absolute bottom-0 right-0 -mr-12 w-24 h-24 rounded-full border-6 ${villain.isStrong ? 'border-red-600 shadow-2xl' : 'border-purple-500 shadow-xl'} z-10 bg-slate-900 overflow-hidden flex items-center justify-center animate-pulse`}>
                    <img src={villain.url} alt={villain.name} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="w-full flex justify-between items-center text-white mt-4">
                <div className="font-bold text-xl md:text-2xl text-yellow-300 drop-shadow-md">
                    擊敗 {villain.name}！ (目標: {target})
                </div>
                <div className={`px-6 py-2 rounded-full border-4 font-extrabold text-2xl shadow-lg transition-colors bg-slate-800 border-slate-600`}>
                    Combo: {score}
                </div>
            </div>
        </div>
    );
};

// === 元件：公仔圖片渲染 (依循獨立圖檔) ===
const RealLegoImage = ({ char, className = "" }) => {
    return (
        <div className={`relative overflow-hidden flex items-center justify-center ${className}`} style={{ clipPath: 'circle(48%)', WebkitClipPath: 'circle(48%)' }}>
            <img
                src={char.url}
                alt={char.name}
                className="w-full h-full object-cover pointer-events-none die-cut-medal"
            />
        </div>
    );
};

// === 元件：載入畫面 ===
const LoadingScreen = ({ progress, heroSkin }) => {
    const hero = CHARACTERS.find(c => c.skin === heroSkin) || CHARACTERS[3];
    
    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="max-w-md w-full space-y-12 relative">
                {/* 旋轉光球背景 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] animate-pulse"></div>

                <div className="space-y-4">
                    <h2 className="text-xl text-yellow-300 font-bold tracking-[0.2em] uppercase">修煉準備中</h2>
                    <h1 className="text-5xl font-black text-white italic">LOADING<span className="text-yellow-400">...</span></h1>
                </div>

                {/* 英雄跑步區 */}
                <div className="relative w-full h-32 flex items-end">
                    <div 
                        className="absolute bottom-6 transition-all duration-300 ease-out"
                        style={{ left: `calc(${progress}% - 40px)` }}
                    >
                        <div className="relative">
                            <img 
                                src={hero.url} 
                                alt="Running Hero" 
                                className="w-24 h-24 object-contain animate-bounce"
                                style={{ 
                                    animationDuration: '0.4s',
                                    transform: 'scaleX(-1)' // Face right
                                }}
                            />
                            {/* 跑步煙霧效果 */}
                            <div className="absolute -left-4 bottom-0 flex gap-1">
                                <div className="w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
                                <div className="w-3 h-3 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 載入條 */}
                <div className="space-y-4">
                    <div className="w-full bg-slate-800 rounded-full h-6 p-1 border-2 border-slate-700 relative overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-300 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 shimmer-anim"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-bold tracking-widest px-2">
                        <span>{progress}%</span>
                        <span className="animate-pulse">正在同步忍術資料...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// === 元件：黃色粒子背景動畫 ===
const Particles = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(25)].map((_, i) => {
                const size = Math.random() * 8 + 4;
                return (
                    <div
                        key={i}
                        className="absolute bg-yellow-400 rounded-full opacity-40 blur-[1px]"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite alternate`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                );
            })}
        </div>
    );
};

export default function App() {
    const [gameState, setGameState] = useState('start'); // start, playing, end, settings, map, training, fail, level_complete
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [wrongOption, setWrongOption] = useState(null);
    const [isPlayerStaggered, setIsPlayerStaggered] = useState(false);
    const [heroEnergy, setHeroEnergy] = useState(100);
    const [correctPopup, setCorrectPopup] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioAllowed, setAudioAllowed] = useState(false);
    const [sessionWrongWords, setSessionWrongWords] = useState([]);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('ninjago_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [newlyUnlocked, setNewlyUnlocked] = useState(null); // tracking for unlock animation
    const [heroSkin, setHeroSkin] = useState(() => localStorage.getItem('heroSkin') || 'kai');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // --- 新增世界/章節系統狀態 ---
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [selectedChapterNodes, setSelectedChapterNodes] = useState([]);

    // --- 新增設定與子關卡狀態 ---
    const [bgmVolume, setBgmVolume] = useState(() => Number(localStorage.getItem('bgmVolume')) || 40);
    const [sfxVolume, setSfxVolume] = useState(() => Number(localStorage.getItem('sfxVolume')) || 80);
    const [speechRate, setSpeechRate] = useState(() => Number(localStorage.getItem('speechRate')) || 0.8);
    const [questionsPerLevel, setQuestionsPerLevel] = useState(() => localStorage.getItem('questionsPerLevel') || "10"); // "10", "20", "30", "max"
    const [globalBattleMode, setGlobalBattleMode] = useState(() => {
        const saved = localStorage.getItem('globalBattleMode');
        return saved !== null ? JSON.parse(saved) : true; // Default to true
    });
    const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => {
        return localStorage.getItem('googleSheetsUrl') || "https://script.google.com/macros/s/AKfycbyDgDV4YLRaa1xfPPo1XkRMZGsVH09548XRIeM4KPYKwuT_Yb8uKLFLDd-kXbGW4IPz/exec";
    });
    const [customWordSets, setCustomWordSets] = useState(() => JSON.parse(localStorage.getItem('customWordSets')) || []);
    const [wordStats, setWordStats] = useState(() => JSON.parse(localStorage.getItem('wordStats')) || {});
    const [selectedSubLevel, setSelectedSubLevel] = useState('all'); // lesson name or set id or 'all'
    const [currentWordPool, setCurrentWordPool] = useState(WORDS_LEVEL_1_2);
    const [targetScore, setTargetScore] = useState(10);
    const [completedLevels, setCompletedLevels] = useState(() => {
        const saved = localStorage.getItem('completedLevels');
        if (!saved) return { levels: [], subLevels: [] };
        
        let data = JSON.parse(saved);
        // 資料遷移: 將 "課" 統一轉換為 "關"
        if (data.subLevels) {
            data.subLevels = data.subLevels.map(name => 
                typeof name === 'string' ? name.replace('課', '關') : name
            );
        }
        return data;
    });

    const activeNodeRef = useRef(null);

    // 當進入地圖時，自動滾動到當前進度位置並聚焦
    useEffect(() => {
        if (gameState === 'map') {
            const currentIdx = MAP_NODES.findIndex(node => !completedLevels.subLevels.includes(node.name));
            const targetNode = MAP_NODES[currentIdx === -1 ? MAP_NODES.length - 1 : currentIdx];
            
            if (targetNode) {
                const scrollAndFocus = () => {
                    if (activeNodeRef.current) {
                        activeNodeRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'center'
                        });
                        // 延遲聚焦以避免與滾動行為衝突
                        setTimeout(() => {
                            activeNodeRef.current?.focus();
                        }, 500);
                        return true;
                    }
                    return false;
                };

                // 嘗試多幾次，確保佈局完成
                if (!scrollAndFocus()) {
                    const timer = setTimeout(scrollAndFocus, 100);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [gameState, completedLevels.subLevels]);

    // 處理地圖鍵盤導覽
    const handleMapKeyDown = (e) => {
        if (gameState !== 'map') return;
        
        const focusedElement = document.activeElement;
        const focusedId = focusedElement?.getAttribute('data-node-id');
        
        if (focusedId === null) return;
        
        let nextId = parseInt(focusedId, 10);
        
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                nextId = Math.max(0, nextId - 1);
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                nextId = Math.min(MAP_NODES.length - 1, nextId + 1);
                break;
            default:
                return;
        }

        // 檢查是否已鎖定
        const isLocked = nextId > 0 && !completedLevels.subLevels.includes(MAP_NODES[nextId - 1].name);
        if (!isLocked) {
            const nextNode = document.querySelector(`[data-node-id="${nextId}"]`);
            nextNode?.focus();
            nextNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const currentVillain = level === 1 ? VILLAIN_LEVEL_1 : (level === 2 ? VILLAIN_LEVEL_2 : VILLAIN_LEVEL_3);

    // 監聽設定變化並儲存
    useEffect(() => {
        localStorage.setItem('bgmVolume', bgmVolume);
        localStorage.setItem('sfxVolume', sfxVolume);
        localStorage.setItem('speechRate', speechRate);
        localStorage.setItem('questionsPerLevel', questionsPerLevel);
        localStorage.setItem('globalBattleMode', JSON.stringify(globalBattleMode));
        localStorage.setItem('googleSheetsUrl', googleSheetsUrl);
        localStorage.setItem('customWordSets', JSON.stringify(customWordSets));
        localStorage.setItem('wordStats', JSON.stringify(wordStats));
        localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
        localStorage.setItem('heroSkin', heroSkin);
    }, [bgmVolume, sfxVolume, speechRate, questionsPerLevel, globalBattleMode, googleSheetsUrl, customWordSets, wordStats, completedLevels, heroSkin]);

    // --- 音效準備 ---
    const audioContext = React.useMemo(() => {
        const createAudio = (src) => {
            const audio = new Audio(src);
            audio.loop = true;
            return audio;
        };
        const createSFX = (src) => new Audio(src);

        return {
            bgm1: createAudio('/assets/bgm1.mp3'),
            bgm2: createAudio('/assets/bgm2.mp3'),
            correct: createSFX('/assets/correct.wav'),
            wrong: createSFX('/assets/wrong.wav')
        }
    }, []);

    // 同步音量設定
    useEffect(() => {
        audioContext.bgm1.volume = bgmVolume / 100;
        audioContext.bgm2.volume = bgmVolume / 100;
        audioContext.correct.volume = sfxVolume / 100;
        audioContext.wrong.volume = sfxVolume / 100;
    }, [bgmVolume, sfxVolume, audioContext]);

    // 處理音樂播放與切換
    useEffect(() => {
        if (!audioAllowed) return;

        if (gameState === 'playing') {
            // For map levels, use bgm2
            if (level === 3) {
                audioContext.bgm1.pause();
                audioContext.bgm2.currentTime = 0;
                audioContext.bgm2.play().catch(e => console.log(e));
            } else { // Fallback for other levels if they were to exist
                audioContext.bgm2.pause();
                audioContext.bgm1.currentTime = 0;
                audioContext.bgm1.play().catch(e => console.log(e));
            }
        } else {
            // Start 或 End 畫面時暫停音樂
            audioContext.bgm1.pause();
            audioContext.bgm2.pause();
        }
    }, [gameState, level, audioAllowed, audioContext]);

    // --- 語音系統 ---
    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-HK';
            utterance.rate = speechRate;
            window.speechSynthesis.speak(utterance);
        }
    }, [speechRate]);
    
    // --- Google Auth 系統 ---
    useEffect(() => {
        /* global google */
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: "977421757055-udocourprogj0595l34kvn2qtd21ejik.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("googleBtn"),
                { theme: "outline", size: "large", shape: "pill" }
            );
        }
    }, [gameState]);

    const handleCredentialResponse = (response) => {
        const userObj = parseJwt(response.credential);
        setUser(userObj);
        localStorage.setItem('ninjago_user', JSON.stringify(userObj));
        // Sync data from sheet after login
        syncFromGoogleSheets(userObj.email);
    };

    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    // --- 紀錄系統 ---
    const logToGoogleSheets = useCallback((targetWord, selectedWord, isCorrect, eventType = "ANSWER") => {
        if (!googleSheetsUrl) return;
        
        const data = {
            timestamp: new Date().toISOString(),
            userEmail: user ? user.email : "anonymous",
            userName: user ? user.name : "Anonymous",
            event: eventType,
            level: level,
            subLevel: selectedSubLevel,
            targetWord: targetWord,
            selectedWord: selectedWord,
            isCorrect: isCorrect
        };

        fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.error("Logging failed:", err));
    }, [googleSheetsUrl, level, selectedSubLevel, user]);

    // --- 同步系統 ---
    const syncToGoogleSheets = useCallback(() => {
        if (!googleSheetsUrl || !user) return;
        const settings = {
            bgmVolume, sfxVolume, speechRate, questionsPerLevel, globalBattleMode, completedLevels, wordStats
        };
        const data = {
            userEmail: user.email,
            event: "SYNC_SETTINGS",
            settings: JSON.stringify(settings)
        };
        fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });
    }, [googleSheetsUrl, user, bgmVolume, sfxVolume, speechRate, questionsPerLevel, globalBattleMode, completedLevels, wordStats]);

    const syncFromGoogleSheets = (email) => {
        if (!googleSheetsUrl) return;
        fetch(`${googleSheetsUrl}?userEmail=${email}&event=GET_SETTINGS`)
            .then(res => res.json())
            .then(data => {
                if (data && data.settings) {
                    const s = JSON.parse(data.settings);
                    setBgmVolume(s.bgmVolume);
                    setSfxVolume(s.sfxVolume);
                    setSpeechRate(s.speechRate);
                    setQuestionsPerLevel(s.questionsPerLevel);
                    setGlobalBattleMode(s.globalBattleMode);
                    setCompletedLevels(s.completedLevels);
                    setWordStats(s.wordStats);
                }
            }).catch(e => console.log("Fetch settings failed", e));
    };

    // 監聽設定變化並同步
    useEffect(() => {
        if (user) syncToGoogleSheets();
    }, [bgmVolume, sfxVolume, speechRate, questionsPerLevel, globalBattleMode, completedLevels, wordStats, user, syncToGoogleSheets]);

    // --- 全螢幕切換 ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // --- 遊戲邏輯 ---
    const generateQuestion = useCallback((overridePool) => {
        // 使用傳入的池或當前狀態的池
        const pool = overridePool || currentWordPool;
        if (!pool || pool.length === 0) return;

        // 檢查是否有優先複習的單字 (Priority List = 以前答錯的)
        const priorityWordsInPool = pool.filter(word => wordStats[word] && wordStats[word].priority);
        // 過濾出普通的單字 (沒有 priority)
        const normalWordsInPool = pool.filter(word => !wordStats[word] || !wordStats[word].priority);

        let targetWord;

        // 大約 70% 的機會優先考錯過的字 (如果有的話)，避免連續一直考同一個讓你覺得很煩
        // 但如果只有 priority 的字，或池子只有不到 3 個字，就強制考
        if (priorityWordsInPool.length > 0 && (Math.random() > 0.3 || normalWordsInPool.length === 0 || pool.length <= 3)) {
            const shuffledPriority = shuffleArray(priorityWordsInPool);
            targetWord = shuffledPriority[0];
        } else {
            // 從普通字池中挑選
            // 【Low Priority Queue 邏輯】：找出 correctCount 最少的字群，只從這群裡面抽
            let minCorrectCount = Infinity;
            
            // 找出最小的正確次數
            normalWordsInPool.forEach(word => {
                const count = wordStats[word] ? wordStats[word].correctCount : 0;
                if (count < minCorrectCount) {
                    minCorrectCount = count;
                }
            });

            // 篩選出正確次數等於最小值的候選字
            const candidateWords = normalWordsInPool.filter(word => {
                const count = wordStats[word] ? wordStats[word].correctCount : 0;
                return count === minCorrectCount;
            });
            
            const shuffledCandidates = shuffleArray(candidateWords);
            targetWord = shuffledCandidates[0];
        }

        const targetLen = targetWord.length;

        // 找寻相同长度的干擾項
        // 1. 先從當前池中找相同字數的（排除目標字）
        let sameLengthPool = pool.filter(w => w !== targetWord && w.length === targetLen);

        // 2. 如果當前池不夠 2 個，從大池（Level 1_2 或 Level 3 全部）補
        if (sameLengthPool.length < 2) {
            const extraPool = shuffleArray([...WORDS_LEVEL_1_2, ...WORDS_LEVEL_3_ALL]);
            const filteredExtra = extraPool.filter(w => w !== targetWord && w.length === targetLen && !sameLengthPool.includes(w));
            sameLengthPool = [...sameLengthPool, ...filteredExtra];
        }

        // 3. 抽取 2 個干擾項
        let distractors = shuffleArray(sameLengthPool).slice(0, 2);

        // 最後的最後，如果還是找不到相同長度的字（理論上極少見），才用原本的邏輯補足（保證遊戲不崩潰）
        if (distractors.length < 2) {
            const fallbackDistractors = pool.filter(w => w !== targetWord && !distractors.includes(w));
            distractors = [...distractors, ...fallbackDistractors.slice(0, 2 - distractors.length)];
        }

        const optionsWords = shuffleArray([targetWord, ...distractors]);
        const shuffledChars = shuffleArray(CHARACTERS);

        const newOptions = optionsWords.map((word, idx) => ({
            word,
            char: shuffledChars[idx],
            isTarget: word === targetWord
        }));

        const newQuestion = { target: targetWord, options: newOptions };
        setCurrentQuestion(newQuestion);
        speak(`${targetWord}`);
        return newQuestion;
    }, [speak, currentWordPool, wordStats]);

    const startAdventure = () => {
        setAudioAllowed(true);
        setGameState('map');
        // Play BGM for map if needed, or keep silent
        audioContext.bgm1.pause();
        audioContext.bgm2.pause();
    };

    const goHome = () => {
        audioContext.bgm1.pause();
        audioContext.bgm2.pause();
        setGameState('start');
        setAudioAllowed(false);
    };

    // 選擇特定子關卡並開始
    const startSubLevel = async (words, subName) => {
        // Determine the actual level based on subName
        let currentLevel = 3; // All map nodes are considered Level 3
        if (subName === 'all' || subName === 'custom') {
            currentLevel = 3; // Or a special level ID for these
        } else {
            const presetIndex = LEVEL_3_PRESETS.findIndex(p => p.name === subName);
            if (presetIndex >= 0 && presetIndex < 20) currentLevel = 1; // Example: first 20 lessons are level 1
            else if (presetIndex >= 20 && presetIndex < 40) currentLevel = 2; // Next 20 are level 2
            else currentLevel = 3; // Remaining are level 3
        }
        setLevel(currentLevel);

        // Check if locked
        const subIdx = LEVEL_3_PRESETS.findIndex(p => p.name === subName);
        if (subIdx === 0 && !completedLevels.levels.includes(0)) { // Assuming Level 0 is a prerequisite for the first map node
            // This logic needs to be refined based on how levels are unlocked.
            // For now, let's assume the first map node is always available if you reach the map.
        } else if (subIdx > 0) {
            const prevSubName = LEVEL_3_PRESETS[subIdx - 1].name;
            if (!completedLevels.subLevels.includes(prevSubName)) {
                speak(`要先完成${prevSubName}先可以玩依個關別呀！`);
                return;
            }
        }

        // 播放音樂 (Battle Theme Starts Now!)
        audioContext.bgm1.pause();
        audioContext.bgm2.currentTime = 0;
        audioContext.bgm2.play().catch(e => console.log(e));

        // --- Added Asset Preloading ---
        setIsLoading(true);
        setLoadingProgress(0);

        const totalToLoad = words.length + CHARACTERS.length + 5;
        let loaded = 0;
        const tick = () => {
            loaded++;
            setLoadingProgress(Math.min(99, Math.floor((loaded / totalToLoad) * 100)));
        };

        // 1. Preload Images
        const imagePaths = ['/assets/home_bg.png', ...CHARACTERS.map(c => c.url)];
        const imgPromises = imagePaths.map(path => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = path;
                img.onload = () => { tick(); resolve(); };
                img.onerror = () => { tick(); resolve(); };
            });
        });

        // 2. Preload Audio
        const audioPromises = [
            audioContext.bgm1, audioContext.bgm2, audioContext.correct, audioContext.wrong
        ].map(audio => {
            return new Promise(resolve => {
                if (audio.readyState >= 3) { tick(); resolve(); }
                else {
                    audio.addEventListener('canplaythrough', () => { tick(); resolve(); }, { once: true });
                    audio.load();
                    setTimeout(() => { tick(); resolve(); }, 2000); // 2s timeout
                }
            });
        });

        // 3. Simulated progress for words (Ninja training)
        const wordSettle = async () => {
            for (let i = 0; i < words.length; i++) {
                await new Promise(r => setTimeout(r, 70)); // Slowed down for cinematic effect
                tick();
            }
        };

        await Promise.all([...imgPromises, ...audioPromises, wordSettle()]);
        
        
        setLoadingProgress(100);
        await new Promise(r => setTimeout(r, 800)); // Show 100% briefly
        
        // --- Fix transition flicker: Change state while still loading ---
        setCurrentWordPool(words);
        setSelectedSubLevel(subName);
        const targetNumber = questionsPerLevel === 'max' ? words.length : parseInt(questionsPerLevel, 10);
        setTargetScore(targetNumber);
        setScore(0);
        setHeroEnergy(100);
        setGameState('playing');

        await new Promise(r => setTimeout(r, 1000)); // Cinematic delay
        setIsLoading(false);

        // --- Original Logic (Cleaned up) ---
        setTimeout(() => {
            const firstQuestion = generateQuestion(words);
            if (firstQuestion) {
                speak(`進入，${subName}！。請回答：${firstQuestion.target}`);
            } else {
                speak(`進入，${subName}！`);
            }
        }, 100);
    };


    const handleOptionClick = (option) => {
        if (correctPopup) return; // 動畫撥放期間阻擋連點

        if (option.isTarget) {
            audioContext.correct.currentTime = 0;
            audioContext.correct.play().catch(e => console.log(e));
            speak('好叻呀！');
            const newScore = score + 1;
            setScore(newScore);

            // 更新答對的統計資料
            setWordStats(prev => {
                const current = prev[option.word] || { wrongCount: 0, correctCount: 0, priority: false };
                return {
                    ...prev,
                    [option.word]: {
                        ...current,
                        correctCount: current.correctCount + 1,
                        priority: false // 答對了就從優先清單移除
                    }
                };
            });

            logToGoogleSheets(currentQuestion.target, option.word, true);
            setCorrectPopup({ char: option.char, element: option.char.element, word: option.word });


            setTimeout(() => {
                setCorrectPopup(null);
                if (newScore >= targetScore) {
                    // Update completion status for map nodes
                    if (selectedSubLevel !== 'all' && selectedSubLevel !== 'custom') {
                        setCompletedLevels(prev => ({
                            ...prev,
                            subLevels: prev.subLevels.includes(selectedSubLevel) ? prev.subLevels : [...prev.subLevels, selectedSubLevel]
                        }));
                    }
                    // Check if all sub-levels are completed to unlock a "main" level if applicable
                    // This logic might need to be more complex if there are main levels to unlock from sub-levels.
                    // For now, just mark the sub-level as complete.

                    logToGoogleSheets(null, null, true, "COMPLETION");
                    setGameState('level_complete'); // 改為前往過關結算畫面
                    speak('恭喜晒！你完成咗呢個任務！');
                } else {
                    generateQuestion();
                }
            }, 2500); // Popup 動畫顯示 2.5 秒
        } else {
            audioContext.wrong.currentTime = 0;
            audioContext.wrong.play().catch(e => console.log(e));
            speak('再試下啦！');

            logToGoogleSheets(currentQuestion.target, option.word, false);

            // 更新 sessionMissedWords
            setSessionWrongWords(prev => {
                if (prev.includes(currentQuestion.target)) return prev;
                return [...prev, currentQuestion.target];
            });

            // 戰鬥模式：扣主角能量
            if (globalBattleMode || selectedSubLevel === "第55關") {
                const newEnergy = Math.max(0, heroEnergy - 25);
                setHeroEnergy(newEnergy);
                if (newEnergy <= 0) {
                    setTimeout(() => {
                        setGameState('training');
                        speak('能量扣晒啦！要進入訓練模式，學返好啲字。');
                    }, 1000);
                }
            } else if (level >= 2) {
                // 普通模式：倒退懲罰
                setScore(prev => Math.max(0, prev - 1));
                setIsPlayerStaggered(true);
                setTimeout(() => setIsPlayerStaggered(false), 500);
            }

            setTimeout(() => setWrongOption(null), 500);
        }
    };

    return (
        <div className="relative w-full min-h-[100dvh] bg-slate-900 overflow-x-hidden overflow-y-auto font-sans select-none flex flex-col md:overflow-hidden">
            {/* Compulsory Login Overlay */}
            {!user && (
                <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full space-y-8 animate-ninja-pop">
                        <div className="space-y-4">
                            <h2 className="text-xl text-yellow-300 font-bold tracking-widest drop-shadow-md">Ninjago Core Authentication</h2>
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-lg leading-tight mb-8">
                                忍者身分<br />驗證
                            </h1>
                            <p className="text-slate-300 text-lg">歡迎來到旋風忍術學院！<br/>請先登錄以開始訓練並同步你的進度。</p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-6 py-8">
                            <div id="googleBtn"></div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3">
                            <h3 className="text-yellow-400 font-bold flex items-center gap-2">
                                <Settings className="w-4 h-4" /> 設定提示 (設定一次即可)
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                1. 請確保你在 Google Cloud 控制台已建立 <b>OAuth 2.0 Client ID</b>。<br/>
                                2. 將 <code>https://ninjago-game.vercel.app</code> 加入授權來源。<br/>
                                3. 更新程式碼中的 <code>client_id</code> 即可解決 "Invalid Client" 錯誤。
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Screen Overlay */}
            {isLoading && <LoadingScreen progress={loadingProgress} heroSkin={heroSkin} />}

            {/* 內聯全局動畫樣式設計 */}
            <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes ninja-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15) rotate(2deg); opacity: 1; }
          75% { transform: scale(0.95) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-15px) rotate(-8deg); }
          40% { transform: translateX(15px) rotate(8deg); }
          60% { transform: translateX(-10px) rotate(-5deg); }
          80% { transform: translateX(10px) rotate(5deg); }
        }
        @keyframes spin-glow {
          0% { transform: rotate(0deg); box-shadow: 0 0 15px #fbbf24; border-color: #fbbf24; }
          100% { transform: rotate(360deg); box-shadow: 0 0 40px #fbbf24, 0 0 80px #eab308; border-color: #fef08a; }
        }
        @keyframes stagger {
          0%, 100% { transform: translate(-50%, -50%); border-color: #facc15; box-shadow: 0 0 15px rgba(250,204,21,1); }
          50% { transform: translate(calc(-50% - 15px), -50%); border-color: #ef4444; box-shadow: 0 0 30px rgba(239,68,68,1); filter: brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(34,197,94,0.5)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 15px rgba(34,197,94,0.8)); }
        }
        @keyframes lightning-bolt {
          0%, 100% { opacity: 1; }
          40%, 45%, 50% { opacity: 0.7; filter: brightness(1.5); }
        }
        @keyframes frost-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes flame-flicker {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.05); filter: contrast(1.2); }
        }
        @keyframes earth-rumble {
          0% { transform: translateY(0); }
          25% { transform: translateY(-1px) translateX(1px); }
          50% { transform: translateY(1px) translateX(-1px); }
          75% { transform: translateY(-1px) translateX(-1px); }
        }
        @keyframes water-wave {
          0%, 100% { clip-path: polygon(0 15%, 15% 10%, 30% 15%, 45% 20%, 60% 15%, 75% 10%, 90% 15%, 100% 20%, 100% 100%, 0% 100%); }
          50% { clip-path: polygon(0 10%, 15% 15%, 30% 20%, 45% 15%, 60% 10%, 75% 15%, 90% 20%, 100% 15%, 100% 100%, 0% 100%); }
        }
        @keyframes shadow-mist {
          0%, 100% { opacity: 0.8; filter: blur(0px); }
          50% { opacity: 1; filter: blur(1px); }
        }
        .glow-pulse { animation: glow-pulse 2s infinite; }
        .lightning-bolt { animation: lightning-bolt 0.5s infinite; }
        .frost-shimmer { background-size: 200% 200%; animation: frost-shimmer 3s linear infinite; }
        .flame-flicker { animation: flame-flicker 0.1s infinite; }
        .earth-rumble { animation: earth-rumble 0.2s infinite; }
        .water-wave { animation: water-wave 2s ease-in-out infinite; }
        .shadow-mist { animation: shadow-mist 3s ease-in-out infinite; }
        
        @keyframes lock-open {
          0% { transform: scale(1); rotate: 0deg; }
          40% { transform: scale(1.2); rotate: -15deg; }
          100% { transform: scale(0); rotate: 360deg; opacity: 0; }
        }
        .lock-open-anim { animation: lock-open 0.8s ease-in-out forwards; }

        @keyframes unlock-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 50px rgba(251,191,36,0.8); }
        }
        .unlock-glow { animation: unlock-glow 2s infinite; }
        
        .shuriken-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        
        /* 戰鬥模式專用動畫 */
        @keyframes hero-attack {
          0% { transform: translateX(0) scale(1.1); }
          30% { transform: translateX(100px) scale(1.3) rotate(15deg); }
          100% { transform: translateX(0) scale(1.1); }
        }
        @keyframes villain-attack {
          0% { transform: translateX(0); }
          30% { transform: translateX(-100px) scale(1.3) rotate(-15deg); }
          100% { transform: translateX(0); }
        }
        @keyframes hit-shake {
          0% { transform: translateX(0); filter: brightness(2) contrast(2); }
          20% { transform: translateX(-20px); }
          40% { transform: translateX(20px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
          100% { transform: translateX(0); filter: brightness(1) contrast(1); }
        }
        .battle-hero-attack { animation: hero-attack 0.5s ease-in-out forwards; }
        .battle-villain-attack { animation: villain-attack 0.5s ease-in-out forwards; }
        .battle-villain-hit { animation: hit-shake 0.4s ease-in-out; }
        .battle-hero-hit { animation: hit-shake 0.4s ease-in-out; }

        .shuriken-spin { animation: spin-glow 1.5s linear infinite; }
        .ninja-pop-anim { animation: ninja-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .shimmer-anim { animation: shimmer 2s infinite; }
        .player-stagger { animation: stagger 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        
        /* 自定義 Slider 樣式 */
        input[type='range'] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          height: 8px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(251,191,36,0.5);
        }
        @keyframes dash {
            to {
                stroke-dashoffset: -1000;
            }
        }
        .map-node:focus {
            outline: none;
            transform: scale(1.15) translate(-50%, -50%);
            z-index: 30;
        }
        .map-node:focus .focus-ring {
            opacity: 1;
            transform: scale(1.2);
        }
        @keyframes focus-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.6); }
            50% { box-shadow: 0 0 40px rgba(251,191,36,1); }
        }
        .focus-ring {
            position: absolute;
            inset: -8px;
            border: 4px solid #fbbf24;
            border-radius: 9999px;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            animation: focus-pulse 1.5s infinite;
        }
      `}</style>

            <Particles />

            {/* 右下角工具欄 */}
            <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-4">
                <button
                    onClick={toggleFullscreen}
                    className="bg-slate-800/80 p-3 rounded-full border-2 border-slate-600 text-white hover:bg-slate-700 transition"
                >
                    {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
                </button>
                {gameState === 'start' && (
                    <button
                        onClick={() => setGameState('settings')}
                        className="bg-slate-800/80 p-3 rounded-full border-2 border-slate-600 text-white hover:bg-slate-700 transition"
                    >
                        <Settings className="w-8 h-8" />
                    </button>
                )}
            </div>

            {/* ===================== 開始畫面 ===================== */}
            {/* ===================== 開始畫面 ===================== */}
            {gameState === 'start' && (
                <div 
                    className="flex flex-col items-center justify-center flex-1 z-10 space-y-12 relative px-4 text-center"
                    onClick={() => {
                        if (!audioAllowed) {
                            setAudioAllowed(true);
                            audioContext.bgm1.currentTime = 0;
                            audioContext.bgm1.play().catch(e => console.log(e));
                        }
                    }}
                >
                    <div className="space-y-4">
                        {/* 移除 Lego Ninjago Core 及 忍者文字大考驗 */}
                    </div>

                    {/* User Profile (If logged in) */}
                    <div className="z-20 flex flex-col items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-4 bg-white/10 p-3 rounded-full border border-white/20">
                                <img src={user.picture} alt="User" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
                                <div className="text-left">
                                    <p className="text-white font-bold leading-none">{user.name}</p>
                                    <p className="text-yellow-400 text-xs">{user.email}</p>
                                </div>
                                <button onClick={() => {
                                    setUser(null);
                                    localStorage.removeItem('ninjago_user');
                                }} className="ml-2 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
                            </div>
                        )}
                    </div>

                    {/* Cinematic Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img 
                            src="/assets/home_bg.png" 
                            className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-80 filter saturate-125" 
                            alt="Ninjago Experience"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>
                    </div>

                    {/* Top Control - Removed redundant Settings icon */}

                    {/* Main Content */}
                    <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
                        <div className="space-y-4 animate-ninja-pop">
                            <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                NINJA<span className="text-yellow-400">GO</span>
                            </h1>
                            <div className="text-2xl md:text-4xl font-bold text-yellow-500 tracking-[0.5em] uppercase drop-shadow-md">
                                旋風忍者：冒險之旅
                            </div>
                            <div className="text-sm font-mono text-white/30 tracking-widest mt-2 uppercase">
                                VER {VERSION}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={() => {
                                    setGameState('map');
                                    speak('準備好開始冒險未？出發！');
                                }}
                                className="group relative px-16 py-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-[32px] shadow-[0_15px_0_rgb(180,130,0)] active:translate-y-2 active:shadow-none transition-all duration-100"
                            >
                                <div className="flex items-center gap-4">
                                    <Play className="w-12 h-12 text-slate-900 fill-slate-900" />
                                    <span className="text-5xl font-black text-slate-900 uppercase">START</span>
                                </div>
                                <div className="absolute -inset-1 bg-yellow-400 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-[32px]"></div>
                            </button>
                            
                            <p className="text-slate-400 font-bold tracking-widest animate-pulse mt-4">
                                — 點擊開始你的忍者修煉之路 —
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== 冒險地圖 ===================== */}
            {gameState === 'map' && (
                <div className="flex flex-col flex-1 z-50 bg-slate-950 relative text-white overflow-hidden animate-ninja-pop">
                    
                    {/* --- 模式 1: 世界選擇 (World Select) --- */}
                    {selectedWorld === null ? (
                        <div className="flex flex-col flex-1 overflow-y-auto bg-slate-950 relative p-6 md:p-12 lg:p-20">
                            {/* Particles inside world select */}
                            <Particles />
                            
                            <div className="relative z-10 max-w-7xl mx-auto w-full space-y-16 pb-20">
                                <div className="text-center space-y-6 relative">
                                    <button 
                                        onClick={goHome} 
                                        className="absolute top-0 left-0 p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-800 transition-all border-2 border-white/10 shadow-2xl group active:scale-95 z-20"
                                    >
                                        <Home className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    </button>
                                    
                                    <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 italic tracking-tighter drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] leading-tight">
                                        NINJA WORLDS
                                    </h1>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="h-px w-12 md:w-32 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
                                        <p className="text-lg md:text-2xl text-slate-400 font-bold uppercase tracking-[0.6em] whitespace-nowrap">探索你的修煉世界</p>
                                        <div className="h-px w-12 md:w-32 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 pt-10">
                                    {MAP_WORLDS.map((world, idx) => {
                                        const prevWorld = idx > 0 ? MAP_WORLDS[idx-1] : null;
                                        const isLocked = prevWorld && prevWorld.levels.some(l => !completedLevels.subLevels.includes(l.name));
                                        
                                        // 計算世界進度
                                        const totalLevels = world.levels.length;
                                        const doneLevels = world.levels.filter(l => completedLevels.subLevels.includes(l.name)).length;
                                        const progressPercent = Math.round((doneLevels / totalLevels) * 100);
                                        const hero = CHARACTERS.find(c => c.id === world.heroId) || CHARACTERS[0];

                                        return (
                                            <div
                                                key={world.name}
                                                className={`group relative flex flex-col rounded-[50px] border-4 transition-all duration-700 overflow-hidden h-[500px] md:h-[600px] shadow-2xl ${
                                                    isLocked 
                                                    ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                                                    : `bg-slate-900/40 ${world.borderColor} hover:scale-[1.05] hover:-translate-y-4 ${world.glowColor} hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]`
                                                }`}
                                            >
                                                {/* 背景圖與動態遮罩 */}
                                                <div className="absolute inset-0 z-0">
                                                    <img src={world.bg} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 blur-sm group-hover:blur-none" alt="" />
                                                    <div className={`absolute inset-0 bg-gradient-to-b ${world.overlayColor} to-slate-950 via-slate-950/40`}></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                                                </div>

                                                <div className="relative z-10 h-full flex flex-col p-8 md:p-10 justify-between">
                                                    {/* Header: World No & Status */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                                            <span className="text-yellow-400 font-black italic tracking-tighter text-lg">CHAPTER 0{world.id + 1}</span>
                                                        </div>
                                                        {isLocked ? (
                                                            <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/10 shadow-lg group-hover:bg-red-500/20 transition-colors">
                                                                <Lock className="w-6 h-6 text-slate-500 group-hover:text-red-400 transition-colors" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-green-500/20 backdrop-blur-md p-3 rounded-2xl border border-green-500/50 shadow-lg shadow-green-500/20">
                                                                <Unlock className="w-6 h-6 text-green-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hero Avatar Center */}
                                                    <div className="flex justify-center -mt-12">
                                                        <div className={`relative ${isLocked ? 'grayscale opacity-40' : ''}`}>
                                                            <div className={`absolute -inset-6 rounded-full blur-3xl opacity-50 animate-pulse ${isLocked ? 'bg-slate-500' : 'bg-white'}`}></div>
                                                            <div className="w-44 h-44 relative z-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" style={{ clipPath: 'circle(48%)', WebkitClipPath: 'circle(48%)' }}>
                                                                <img src={world.medal} className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] die-cut-medal" alt={hero.name} />
                                                            </div>
                                                            <div className="absolute inset-0 rounded-full border-4 border-white/20 z-20 pointer-events-none"></div>
                                                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-transform z-20">
                                                                {world.emoji}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Content: Title, Progress, Button */}
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <h2 className="text-4xl font-black text-white group-hover:text-yellow-400 transition-colors tracking-tighter italic">{world.name}</h2>
                                                            <p className="text-sm text-slate-300 font-bold line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                                {world.description}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                                <span>修煉進度</span>
                                                                <span className="text-yellow-400">{progressPercent}%</span>
                                                            </div>
                                                            <div className="h-2.5 bg-slate-800/50 rounded-full border border-white/5 overflow-hidden p-0.5">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-1000 delay-300 relative ${isLocked ? 'bg-slate-700' : 'bg-gradient-to-r from-yellow-400 to-amber-600'}`}
                                                                    style={{ width: isLocked ? '0%' : `${progressPercent}%` }}
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 shimmer-anim"></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isLocked ? (
                                                            <div className="w-full py-5 bg-slate-800/50 border-2 border-white/5 rounded-3xl text-slate-500 font-black flex items-center justify-center gap-3">
                                                                尚未解鎖 🔒
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedWorld(world);
                                                                    setSelectedChapterNodes(generateChapterNodes(world.levels));
                                                                    speak(`準備前往，${world.name}！`);
                                                                }}
                                                                className="w-full py-5 bg-white text-slate-900 font-black text-lg rounded-3xl shadow-[0_10px_0_rgb(200,200,200)] hover:shadow-none hover:translate-y-1 active:translate-y-2 transition-all duration-100 flex items-center justify-center gap-3 group/btn"
                                                            >
                                                                <Play className="w-5 h-5 fill-slate-900 group-hover/btn:scale-125 transition-transform" />
                                                                進入挑戰
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- 模式 2: 章節地圖 (Chapter Map) --- */
                        <div className="flex flex-col h-full bg-slate-950 relative">
                            {/* 頂部導航 */}
                            <div className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-30">
                                <button 
                                    onClick={() => setSelectedWorld(null)} 
                                    className="p-4 rounded-full bg-slate-800/80 hover:bg-slate-700 transition border border-white/10 z-50 flex items-center gap-2 group"
                                >
                                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden md:block font-black pr-2">世界選擇</span>
                                </button>
                                <div className="text-center">
                                    <h1 className="text-3xl font-black text-yellow-400 tracking-tighter italic uppercase">{selectedWorld.name}</h1>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em]">{selectedWorld.subtitle}</p>
                                </div>
                                <div className="w-16 md:w-32"></div>
                            </div>

                            {/* 章節內容 (不捲動，適配視窗) */}
                            <div className="flex-1 relative overflow-hidden bg-center bg-cover" style={{ backgroundImage: `url(${selectedWorld.bg})` }}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${selectedWorld.overlayColor}`}></div>
                                
                                <div className="relative w-[1000px] h-full mx-auto" style={{ height: 'calc(100vh - 120px)' }}>
                                    {/* SVG Paths Layer (Centered & Glow) */}
                                    <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '1000px', height: '100%' }}>
                                        <defs>
                                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="3" result="blur"/>
                                                <feMerge>
                                                    <feMergeNode in="blur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        {selectedChapterNodes.slice(0, -1).map((node, i) => {
                                            const nextNode = selectedChapterNodes[i + 1];
                                            const isCompleted = completedLevels.subLevels.includes(node.name);
                                            const isNextCompleted = completedLevels.subLevels.includes(nextNode.name);
                                            const cp1y = node.y + (nextNode.y - node.y) * 0.5;
                                            const cp2y = node.y + (nextNode.y - node.y) * 0.5;
                                            
                                            return (
                                                <g key={`group-${i}`}>
                                                    <path
                                                        d={`M ${node.x} ${node.y} C ${node.x} ${cp1y}, ${nextNode.x} ${cp2y}, ${nextNode.x} ${nextNode.y}`}
                                                        fill="none"
                                                        stroke="rgba(0,0,0,0.4)"
                                                        strokeWidth="10"
                                                        strokeLinecap="round"
                                                        className="translate-y-2 translate-x-1"
                                                    />
                                                    <path
                                                        d={`M ${node.x} ${node.y} C ${node.x} ${cp1y}, ${nextNode.x} ${cp2y}, ${nextNode.x} ${nextNode.y}`}
                                                        fill="none"
                                                        stroke={isCompleted && isNextCompleted ? (selectedWorld.id === 2 ? "#ef4444" : "#4ade80") : "white"}
                                                        strokeWidth={isCompleted && isNextCompleted ? "5" : "3"}
                                                        strokeDasharray={isCompleted && isNextCompleted ? "0" : "8,12"}
                                                        opacity={isCompleted && isNextCompleted ? "1" : "0.2"}
                                                        strokeLinecap="round"
                                                        className={isCompleted && isNextCompleted ? "animate-path-flow" : ""}
                                                        style={{ 
                                                            filter: isCompleted && isNextCompleted ? 'url(#glow)' : 'none',
                                                            transition: 'all 1.5s ease'
                                                        }}
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* 繪製關卡點位 */}
                                    {selectedChapterNodes.map((node, idx) => {
                                        const globalIdx = node.id;
                                        const isLocked = globalIdx > 0 && !completedLevels.subLevels.includes(LEVEL_3_PRESETS[globalIdx - 1].name);
                                        const isCompleted = completedLevels.subLevels.includes(node.name);
                                        const firstUncompletedGlobalIdx = LEVEL_3_PRESETS.findIndex(n => !completedLevels.subLevels.includes(n.name));
                                        const isActive = globalIdx === (firstUncompletedGlobalIdx === -1 ? LEVEL_3_PRESETS.length - 1 : firstUncompletedGlobalIdx);

                                        return (
                                            <div
                                                key={node.name}
                                                className="absolute z-10 transition-all duration-700 animate-float-node"
                                                style={{ 
                                                    left: `${node.x}px`, 
                                                    top: `${node.y}px`, 
                                                    transform: 'translate(-50%, -50%)',
                                                    '--float-duration': `${3 + idx * 0.2}s`
                                                }}
                                            >
                                                {/* Floating Island Base */}
                                                <div className={`relative group w-24 h-24 flex items-center justify-center rounded-3xl transition-all duration-500 shadow-2xl ${
                                                    isLocked 
                                                    ? 'bg-slate-900 border-2 border-slate-800 opacity-40 grayscale' 
                                                    : `cursor-pointer ring-4 ring-offset-4 ring-offset-transparent transform hover:scale-110 active:scale-90 ${
                                                        isActive 
                                                        ? 'ring-yellow-400 border-4 border-yellow-300 bg-slate-800 shadow-[0_0_40px_rgba(250,204,21,0.5)]' 
                                                        : isCompleted 
                                                            ? 'ring-green-500/50 border-4 border-green-400 bg-slate-800' 
                                                            : 'ring-white/20 border-4 border-slate-600 bg-slate-800'
                                                      }`
                                                }`}>
                                                    {/* Texture / Detail on platform */}
                                                    <div className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]"></div>
                                                    </div>

                                                    {/* Content: Number or Icon */}
                                                    <div className="relative font-black text-2xl italic tracking-tighter z-20">
                                                        {isLocked ? (
                                                            <XCircle className="w-8 h-8 text-slate-600" />
                                                        ) : isCompleted ? (
                                                            <div className="relative translate-y-1">
                                                                {/* Ninja Shuriken Marker (Sharp 4-Point Design) */}
                                                                <svg viewBox="0 0 100 100" className="w-14 h-14 text-slate-100 drop-shadow-[0_5px_10px_rgba(0,0,0,1)] animate-shuriken-impact">
                                                                    <path fill="currentColor" d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" />
                                                                    <circle cx="50" cy="50" r="5" fill="black" />
                                                                </svg>
                                                                <div className="absolute inset-0 bg-green-400/30 blur-2xl rounded-full scale-150 animate-aura-pulse"></div>
                                                            </div>
                                                        ) : (
                                                            <span className={isActive ? 'text-yellow-400 text-3xl' : 'text-slate-400'}>{idx + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Click Area */}
                                                    {!isLocked && (
                                                        <div 
                                                            className="absolute inset-0 z-30" 
                                                            onClick={() => startSubLevel(node.words, node.name)}
                                                        ></div>
                                                    )}
                                                </div>

                                                {/* Player Indicator: The Hero Sprite & Flag */}
                                                {isActive && (
                                                    <div className="absolute -top-[110px] left-1/2 -translate-x-1/2 pointer-events-none z-40 flex flex-col items-center select-none">
                                                        {/* Nobori Banner (War Flag) */}
                                                        <div className="absolute -right-14 -top-8 w-12 h-32 flex flex-col items-center animate-banner-wave origin-bottom">
                                                            <div className="w-1.5 h-32 bg-amber-950 rounded-full border border-black/20"></div>
                                                            <div className="absolute top-2 left-1.5 w-11 h-20 bg-gradient-to-b from-yellow-400 to-amber-500 border-2 border-amber-950 rounded-sm flex items-center justify-center shadow-2xl">
                                                                <span className="text-amber-950 font-black text-2xl [writing-mode:vertical-rl] py-2">{idx + 1}</span>
                                                            </div>
                                                        </div>

                                                        {/* Hero Sticker with Premium Aura */}
                                                        <div className="w-36 h-36 relative group" style={{ clipPath: 'circle(48%)', WebkitClipPath: 'circle(48%)' }}>
                                                            <div className="absolute inset-0 bg-yellow-400/40 blur-3xl rounded-full scale-110 animate-aura-pulse"></div>
                                                            <div className="absolute inset-4 bg-white/30 blur-xl rounded-full animate-pulse transition-all group-hover:scale-150"></div>
                                                            <img 
                                                                src={CHARACTERS.find(c => c.skin === heroSkin)?.url} 
                                                                alt="hero" 
                                                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform duration-500 die-cut-medal" 
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 z-20 pointer-events-none scale-90"></div>
                                                        
                                                        {/* Location Badge */}
                                                        <div className="bg-yellow-400 text-slate-900 px-5 py-2 rounded-full font-black text-xs shadow-[0_10px_20px_rgba(0,0,0,0.4)] border-2 border-slate-900 whitespace-nowrap -mt-6 z-20 animate-bounce uppercase tracking-tighter">
                                                            當前階段
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Label Below Node */}
                                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-lg backdrop-blur-sm ${
                                                        isActive ? 'bg-yellow-400 text-slate-900' : 'bg-slate-900/80 text-slate-400'
                                                    }`}>
                                                        {node.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Player Icon on current node (REDUNDANT - removed) */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===================== 遊玩畫面 ===================== */}
            {gameState === 'playing' && currentQuestion && (
                <React.Fragment>
                    {/* 頂部導航與設定 */}

                    {/* 答對時的彈出巨大公仔動畫蓋板 */}
                    {correctPopup && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
                            <div className="ninja-pop-anim flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[80px] opacity-70"></div>
                                    <RealLegoImage
                                        char={correctPopup.char}
                                        className="w-72 h-72 md:w-96 md:h-96 rounded-full border-[12px] border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,1)] z-10 relative bg-slate-800"
                                    />
                                </div>
                                <div className="mt-8 bg-black/90 border-4 border-yellow-400 text-yellow-400 px-10 py-5 rounded-3xl transform -rotate-3 shadow-2xl">
                                    <h2 className="text-5xl md:text-6xl font-black text-center">{correctPopup.element} 旋風忍術！</h2>
                                    <p className="text-4xl md:text-5xl font-bold text-white text-center mt-3 tracking-widest">{correctPopup.word}！</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-between h-full z-10 w-full max-w-5xl mx-auto p-4 py-6">

                        {/* 頂部：敵人血條與進度區塊 */}
                        <ProgressBar 
                            score={score} 
                            target={targetScore} 
                            heroEnergy={heroEnergy}
                            villain={currentVillain}
                            isStaggered={isPlayerStaggered}
                            isHeroAttacking={!!correctPopup}
                            isBattleMode={globalBattleMode || selectedSubLevel === "第55關"}
                            heroSkin={heroSkin}
                            themeIndex={
                                level < 3 
                                ? (level - 1) 
                                : LEVEL_3_PRESETS.findIndex(p => p.name === selectedSubLevel) + 2
                            }
                        />

                        <div className="w-full flex justify-end items-center text-white px-2 mt-[-20px] mb-4">
                            <div className={`bg-slate-800 text-yellow-300 px-4 py-1 rounded-full border-2 border-slate-600 font-bold text-lg shadow-md`}>
                                {selectedSubLevel === 'all' ? '隨機挑戰' : selectedSubLevel}
                            </div>
                        </div>

                        {/* 中央：純語音發問區 (強迫聽音) */}
                        <div className="flex flex-col items-center justify-center flex-1 w-full mt-2">
                            <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95"
                                onClick={() => speak(`${currentQuestion.target}`)}>
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border-[4px] border-blue-400/50 shadow-xl flex items-center justify-center">
                                    <span className="text-[60px] md:text-[80px] font-black text-white/80 drop-shadow-lg">?</span>
                                </div>
                                {/* 發音喇叭小圖示 */}
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 rounded-full p-2 border-2 border-white shadow-xl flex items-center justify-center">
                                    <Volume2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="mt-4 text-blue-200 text-xl font-bold tracking-widest animate-pulse">點擊問號再聽一次</p>
                        </div>

                        {/* 底部：手裏劍選項與忍者 */}
                        <div className="w-full flex justify-center items-end gap-4 md:gap-12 pb-4">
                            {currentQuestion.options.map((option, idx) => {
                                const isWrong = wrongOption === option.word;
                                const isCorrectAnimated = correctPopup && correctPopup.word === option.word;

                                return (
                                    <div key={idx} className="flex flex-col items-center group">
                                        {/* 忍者公仔 (站在手裏劍旁邊) */}
                                        <RealLegoImage
                                            char={option.char}
                                            className={`w-16 h-16 md:w-28 md:h-28 rounded-full border-4 ${option.char.colorClass.replace('text', 'border')} bg-slate-800 shadow-lg transform translate-y-4 group-hover:-translate-y-2 transition-transform duration-300 z-0`}
                                        />

                                        {/* 手裏劍按鈕 */}
                                        <button
                                            onClick={() => handleOptionClick(option)}
                                            className={`
                        relative z-10 w-24 h-24 md:w-36 md:h-36 rounded-full border-[6px] border-slate-400 bg-slate-700 
                        shadow-xl flex items-center justify-center overflow-hidden
                        transition-all duration-200 hover:scale-105 active:scale-95
                        ${isWrong ? 'shuriken-shake bg-red-900 border-red-500' : ''}
                        ${isCorrectAnimated ? 'shuriken-spin' : ''}
                        ${wordStats[option.word]?.priority ? 'shadow-[0_0_20px_rgba(220,38,38,0.8)] border-red-500/50 outline outline-4 outline-red-500/30' : ''}
                      `}
                                        >
                                            {/* 手裏劍的造型裝飾 (四個角) */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-slate-400/30 rotate-45"></div>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-slate-400/30 -rotate-45"></div>
                                            </div>

                                            <span className="text-4xl md:text-6xl font-black text-white relative z-20 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                                {option.word}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 左下角：顯示當前學習內容（如果是子關卡） */}
                        <div className="absolute bottom-6 left-6 z-40 pointer-events-none">
                            {level === 3 && (
                                <div className="bg-yellow-500/90 text-slate-900 px-6 py-3 rounded-2xl font-black shadow-2xl backdrop-blur-sm pointer-events-auto border-2 border-yellow-600/50 text-xl">
                                    {selectedSubLevel === 'all' ? '全部隨機挑戰' : selectedSubLevel === 'custom' ? '自定義題目' : selectedSubLevel}
                                </div>
                            )}
                        </div>

                        {/* 右下角導航按鈕 (遊戲中) - 設定在上面，主頁在下面 */}
                        <div className="absolute bottom-6 left-6 z-50 pointer-events-auto">
                            <button onClick={goHome} className="bg-slate-800/80 p-3 rounded-full border-2 border-slate-600 text-white hover:bg-slate-700 transition shadow-lg">
                                <Home className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </React.Fragment>
            )
            }



            {/* ===================== 設定畫面 ===================== */}
            {
                gameState === 'settings' && (
                    <div className="flex flex-col items-center justify-center h-full z-50 bg-slate-900/95 backdrop-blur-md relative px-4 text-white overflow-y-auto py-12">
                        <button onClick={goHome} className="absolute bottom-6 left-6 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 transition z-50">
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <div className="w-full max-w-xl space-y-10">
                            <h2 className="text-5xl font-black text-center text-yellow-400 mb-12">遊戲設定</h2>

                            {/* 音量控制 */}
                            <div className="space-y-8 bg-slate-800/50 p-8 rounded-3xl border-2 border-slate-700">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-2xl font-bold flex items-center gap-3">
                                            <Volume2 className="text-blue-400" /> 背景音樂
                                        </label>
                                        <span className="text-xl font-mono">{bgmVolume}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" value={bgmVolume}
                                        onChange={(e) => setBgmVolume(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-2xl font-bold flex items-center gap-3">
                                            <Volume2 className="text-green-400" /> 遊戲音效
                                        </label>
                                        <span className="text-xl font-mono">{sfxVolume}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" value={sfxVolume}
                                        onChange={(e) => {
                                            setSfxVolume(Number(e.target.value));
                                            // 預覽音效
                                            audioContext.correct.play().catch(() => { });
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* 語音控制 */}
                            <div className="space-y-8 bg-slate-800/50 p-8 rounded-3xl border-2 border-slate-700">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-2xl font-bold flex items-center gap-3">
                                            🗣️ 語音速度
                                        </label>
                                        <span className="text-xl font-mono">{speechRate.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="1.5" step="0.1" value={speechRate}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setSpeechRate(val);
                                            speak("好叻呀"); // 預覽語速
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* 關卡題數控制 */}
                            <div className="space-y-6 bg-slate-800/50 p-8 rounded-3xl border-2 border-slate-700">
                                <label className="text-2xl font-bold flex items-center gap-3">
                                    🎯 每關測驗題數
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {['10', '20', '30', 'max'].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setQuestionsPerLevel(val)}
                                            className={`py-3 rounded-xl font-bold text-xl transition-all border-2 ${
                                                questionsPerLevel === val 
                                                    ? 'bg-yellow-500 text-slate-900 border-yellow-400 scale-105 shadow-lg' 
                                                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                                            }`}
                                        >
                                            {val === 'max' ? '全部單字' : val}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400">
                                </p>
                            </div>

                            {/* 全局對打模式開關 */}
                            <div className="space-y-6 bg-slate-800/50 p-8 rounded-3xl border-2 border-slate-700">
                                <div className="flex justify-between items-center">
                                    <label className="text-2xl font-bold flex items-center gap-3">
                                        ⚔️ 全局對打模式
                                    </label>
                                    <button
                                        onClick={() => setGlobalBattleMode(!globalBattleMode)}
                                        className={`w-20 h-10 rounded-full flex items-center transition-colors px-1 ${
                                            globalBattleMode ? 'bg-green-500 justify-end' : 'bg-slate-600 justify-start'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white shadow-md transform transition-transform"></div>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-400">
                                    * 預設只有第55關會觸發對打模式。開啟此選項後，所有關卡都將使用主角與壞人對打的血條模式！
                                </p>
                            </div>

                             <button
                                onClick={goHome}
                                className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-2xl rounded-2xl transition-all active:scale-95"
                            >
                                確定並返回
                            </button>

                            {/* Google Sheets 設定 */}
                            <div className="space-y-6 bg-slate-800/50 p-8 rounded-3xl border-2 border-slate-700">
                                <label className="text-2xl font-bold flex items-center gap-3">
                                    📊 Google Sheets Logging URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://script.google.com/macros/s/.../exec"
                                    value={googleSheetsUrl}
                                    onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
                                />
                                <p className="text-sm text-slate-400">
                                    貼上您的 Google Apps Script Web App URL 以啟用答題紀錄功能。
                                </p>
                            </div>

                            {/* 選擇英雄角色 */}
                            <div className="space-y-6 pt-6 border-t border-slate-800">
                                <label className="text-2xl font-bold flex items-center gap-3">
                                    👤 選擇冒險英雄
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {CHARACTERS.map(char => (
                                        <button
                                            key={char.skin}
                                            onClick={() => {
                                                setHeroSkin(char.skin);
                                                speak(`我係，${char.name}！出發啦！`);
                                            }}
                                            className={`relative p-2 rounded-2xl border-4 transition-all ${
                                                heroSkin === char.skin 
                                                ? 'border-yellow-400 bg-slate-700 shadow-lg' 
                                                : 'border-transparent bg-slate-800 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden mb-2">
                                                <img src={char.url} className="w-full h-full object-cover" alt={char.name} />
                                            </div>
                                            <div className={`text-sm font-black ${heroSkin === char.skin ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {char.name}
                                            </div>
                                            {heroSkin === char.skin && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 rounded-full p-1 shadow-md">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===================== 輸掉畫面 (只用於戰鬥) ===================== */}
            {
                gameState === 'fail' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6">
                        <div className="max-w-md w-full bg-slate-900 border-4 border-red-600 rounded-[40px] p-10 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center space-y-8 animate-bounce-short">
                            <div className="w-32 h-32 bg-red-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
                                <XCircle className="w-20 h-20 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black text-white">任務失敗</h1>
                                <p className="text-red-400 text-xl font-bold">主角冇晒能量啦！</p>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        setScore(0);
                                        setHeroEnergy(100);
                                        setSessionWrongWords([]);
                                        setGameState('playing');
                                        generateQuestion();
                                    }}
                                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-2xl transition-all active:scale-95 shadow-lg border-b-4 border-red-800"
                                >
                                    重新挑戰
                                </button>
                                <button
                                    onClick={goHome}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xl rounded-2xl transition-all active:scale-95"
                                >
                                    返回主頁
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===================== 訓練模式畫面 ===================== */}
            {
                gameState === 'training' && (
                    <div className="flex flex-col items-center justify-center h-full z-50 bg-slate-900/98 backdrop-blur-xl relative px-4 text-white overflow-y-auto py-12">
                        <div className="w-full max-w-4xl space-y-10 text-center">
                            <div className="inline-block p-4 bg-yellow-500 rounded-full animate-pulse mb-4">
                                <Info className="w-12 h-12 text-slate-900" />
                            </div>
                            <h2 className="text-6xl font-black text-yellow-400 leading-tight">旋風訓練場</h2>
                            <p className="text-2xl text-slate-300 font-bold">
                                剛才這些字詞不小心選錯了，<br />點擊它們再聽一次，學會後就能重返戰場！
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-10">
                                {sessionWrongWords.map((word, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            speak(word);
                                            // 也可以教他認字
                                            const chars = word.split('');
                                            if (chars.length > 1) {
                                                setTimeout(() => {
                                                    speak(`呢個係，${chars.join('，')}`);
                                                }, 1000);
                                            }
                                        }}
                                        className="p-8 bg-slate-800 border-4 border-blue-500/50 rounded-[32px] hover:border-yellow-400 hover:bg-slate-700 transition-all text-4xl font-black shadow-xl scale-100 hover:scale-105 active:scale-95"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setHeroEnergy(50); // 補充一半能量
                                    setGameState('playing');
                                    speak('能量補充完成！再接再厲！');
                                    generateQuestion();
                                }}
                                className="px-12 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black text-3xl rounded-3xl transition-all shadow-[0_10px_20px_rgba(22,163,74,0.4)] border-b-8 border-green-800 active:transform active:translate-y-2 active:border-b-0"
                            >
                                完成訓練，繼續挑戰！
                            </button>
                        </div>
                    </div>
                )
            }



            {/* Level Complete Summary Screen */}
            {gameState === 'level_complete' && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 text-center overflow-hidden">
                    <div className="relative ninja-pop-anim max-w-2xl w-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400/20 blur-[100px] rounded-full animate-pulse"></div>
                        
                        <div className="relative z-10 space-y-8 bg-slate-800/50 border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl">
                             <div className="inline-block p-4 bg-yellow-400/20 rounded-full mb-4">
                                <Trophy className="w-16 h-16 text-yellow-400" />
                             </div>
                             
                             <div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                                    任務達成！
                                </h1>
                                <p className="text-yellow-400 text-xl md:text-2xl font-bold uppercase tracking-widest">
                                    你已完成第 {level} 關考驗
                                </p>
                             </div>

                             <div className="flex flex-col gap-4 items-center">
                                <div className="text-slate-300 font-bold text-lg md:text-xl">目前戰績進度</div>
                                {(() => {
                                    const levels = completedLevels?.levels || [];
                                    const subLevels = completedLevels?.subLevels || [];
                                    const totalUnits = 2 + (LEVEL_3_PRESETS?.length || 0);
                                    const completedUnits = (levels.includes(1) ? 1 : 0) + 
                                                         (levels.includes(2) ? 1 : 0) + 
                                                         subLevels.length;
                                    const progressPercent = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
                                    const remaining = totalUnits - completedUnits;

                                    return (
                                        <>
                                            <div className="w-full bg-slate-700/50 rounded-full h-8 relative overflow-hidden border-2 border-white/10 p-1">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000 ease-out relative"
                                                    style={{ width: `${progressPercent}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 shimmer-anim"></div>
                                                </div>
                                            </div>
                                            <div className="text-white font-black text-xl md:text-2xl mt-2 drop-shadow-md">
                                                {remaining <= 0 
                                                    ? "你已經征服了所有關卡！🎉" 
                                                    : `還剩下 ${remaining} 個任務等待解鎖！`}
                                            </div>
                                        </>
                                    );
                                })()}
                             </div>

                             <button 
                                onClick={() => setGameState('map')} 
                                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-black text-2xl rounded-2xl shadow-[0_10px_0_rgb(180,130,0)] active:translate-y-1 active:shadow-none transition-all duration-100 flex items-center justify-center gap-3"
                             >
                                <Play className="w-6 h-6 fill-slate-900" />
                                繼續冒險
                             </button>

                             <button 
                                onClick={goHome} 
                                className="absolute bottom-6 left-6 p-4 bg-slate-800/80 hover:bg-slate-800 text-slate-400 font-bold rounded-full transition-all flex items-center justify-center gap-3 border border-white/5 z-50 shadow-2xl"
                             >
                                <Home className="w-8 h-8" />
                             </button>
                        </div>
                        
                        {/* Decorative Icons */}
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl -rotate-12 animate-bounce">🔥</div>
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl rotate-12 animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</div>
                    </div>
                </div>
            )}
        </div>
    );
}
