/*
Name : ZyncSpark
Bot : Sparkle MD
Support : Chat Gpt
Wa : 6283854859219
Tele : t.me/Kyletzy13
Web : zync-spark.vercel.app
*/

const chalk = require("chalk");
const fs = require("fs");

//〔✦〕 𝙎𝙀𝙏𝙏𝙄𝙉𝙂𝘼𝙉 𝘽𝙊𝙏〔✦〕 //
global.owner = "6283854859219"
global.bot = "6283113038096"
global.namaOwner = "Kael"
global.namaBot = "Chitose Ai"

// 〔♥︎〕𝙎𝙀𝙏𝙏𝙄𝙉𝙂𝘼𝙉 𝙊𝙏𝙃𝙀𝙍〔♥︎〕
global.mode_public = true
global.packname = "By Chitose"
global.author = "Kael"
global.thumb = "https://files.catbox.moe/84tt7c.jpg"
// Setting Tumbnail //
global.thumbnails = [
  "https://files.catbox.moe/aofjvu.jpg",
  "https://files.catbox.moe/3malb2.jpg",
  "https://files.catbox.moe/0ff9xy.jpg",
  "https://files.catbox.moe/w67f2b.jpg"
]

global.getThumbnail = () =>
  global.thumbnails[
    Math.floor(Math.random() * global.thumbnails.length)
  ]
  
global.mess = {
owner: "Sparkle Gak Kenal Kamu Siapa!! Kamu pasti Bukan Zync My Suami!!!.", 
group: "Ini Fitur Dipake nya di Group!! Bukan Private!!!", 
private: "Gak Boleh Di sini Sayangg, Private Chat Aja Yuk.", 
admin: "Kamu Siapa Sih? Kalo bukan admin Fitur ini Gak bakal aku Kasih Akses!!.", 
botadmin: "Aku Admin Bukan Yahh? Adminin Dulu!!!.", 
}

global.linkown = "https://wa.me/6283854859219?text=Halo%20Zync"

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Spark Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})