const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path")
const FormData = require("form-data")
const axios = require("axios");
const fetch = require("node-fetch");
const ssh2 = require("ssh2");
const { tmpdir } = require("os");
const Crypto = require("crypto");
const ff = require('fluent-ffmpeg');
const { exec, spawn, execSync } = require('child_process');
const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    getContentType,
    jidDecode,
    MessageRetryMap,
    proto,
    delay, 
    Browsers
} = require("@whiskeysockets/baileys");
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExif,
    exifAvatar,
    addExif 
} = require("./function/stick.js")
const { rankDB, saveRank, updateRank} = require('./lib/rank')
let afk = require("./lib/afk");
let _afk = JSON.parse(fs.readFileSync('./database/afk.json'))
const { doAbsen, listAbsen } = require('./lib/absen')
const { addWarn, removeWarn, resetWarn, listWarn } = require('./lib/warn')
//────────「SPARKLE」────────//
const spamDetector = new Map();
let hdQueue = [];
let isProcessingHD = false;
module.exports = async (m, spark, store) => {
try {
const isCmd = m?.body?.startsWith(m.prefix)
const prefix = '.';
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m.body.trim().split(/ +/).slice(1)
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? m.body.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const groupMetadata = m?.isGroup ? await spark.groupMetadata(m.chat).catch(() => ({})) : {};
const participants = m?.isGroup ? groupMetadata.participants?.map(p => {
    let admin = null;
    if (p.admin === 'superadmin') admin = 'superadmin';
    if (p.admin === 'admin') admin = 'admin';
    return {
        jid: p.jid || null,
        admin
    };
}) || [] : [];
const botNumber = await spark.user.id.split(":")[0]+"@s.whatsapp.net"
const groupAdmins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.jid);
const isOwner = global.owner+"@s.whatsapp.net" == m.sender || m.sender == botNumber
const isAdmin = m?.isGroup ? groupAdmins.includes(m.sender) : false;
const isBot = botNumber == m.sender
const isBotAdmin = m?.isGroup ? groupAdmins.includes(`${bot}@s.whatsapp.net`) : false;
const ppUrl = await spark.profilePictureUrl(m.chat, 'image').catch(() => ({}))
const ppUsr = await spark.profilePictureUrl(m.sender, 'image').catch(() => ({}))
 const groupName = groupMetadata.subject
  if (m.isGroup) {
    let meta = await global.groupMetadataCache.get(m.chat)
    if (!meta) meta = await spark.groupMetadata(m.chat).catch(_ => {})
    m.metadata = meta;
    const p = meta?.participants || [];
    m.isAdmin = p?.some(i => (i.id === m.sender || i.jid === m.sender) && i.admin !== null);
    m.isBotAdmin = p?.some(i => (i.id === botNumber || i.jid == botNumber) && i.admin !== null);
  } 
let db = {};
try {
    db = JSON.parse(fs.readFileSync('./database/GroupSettings.json', 'utf-8'));
} catch {
    db = {};
}   
 if (isBot) return
const uguu = require("./lib/uggu")
const remini = require("./lib/remini")  
const isAfkOn = afk.checkAfkUser(m.sender, _afk)
// ======================
// LOG GROUP TEXT (HD)
// ======================
const wibTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
  .toLocaleTimeString('id-ID', { hour12: false });
const logRow = (color, label, value, width = 42) => {
    const labelPad = 8;
    const space = width - labelPad - 5;
    const cleanValue = String(value).slice(0, space);
    return color('║ ') + chalk.white(label.padEnd(labelPad) + '│ ') + chalk.blue(cleanValue.padEnd(space)) + color('║');
};

// ======================
// LOG GROUP TEXT (HD)
// ======================
if (!isCmd && m.text && m.isGroup) {
    const color = chalk.magenta;
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    
    console.log(color('╔' + '═'.repeat(42) + '╗'));
    console.log(color('║') + chalk.bgGreen.magenta.bold('          GROUP MESSAGE INCOMING          ') + color('║'));
    console.log(color('╟' + '─'.repeat(42) + '╢'));
    console.log(logRow(color, 'USER', m.pushName));
    console.log(logRow(color, 'ID', m.sender.split('@')[0]));
    console.log(logRow(color, 'GROUP', (groupName || 'Unknown').slice(0, 25)));
    console.log(logRow(color, 'TEXT', m.text.replace(/\n/g, ' ')));
    console.log(logRow(color, 'STATUS', `ONLINE | RAM: ${ram}MB`));
    console.log(color('╚' + '═'.repeat(42) + '╝'));
}

// ======================
// LOG GROUP COMMAND (HD)
// ======================
if (isCmd && m.text && m.isGroup) {
    const color = chalk.magenta;
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    console.log(color('╔' + '═'.repeat(42) + '╗'));
    console.log(color('║') + chalk.bgRed.white.bold('          COMMAND DETECTED [!]          ') + color('║'));
    console.log(color('╟' + '─'.repeat(42) + '╢'));
    console.log(logRow(color, 'ADMIN', groupAdmins.length + ' Staff'));
    console.log(logRow(color, 'CALLER', m.pushName));
    console.log(logRow(color, 'EXEC', m.text));
    console.log(logRow(color, 'TIME', wibTime));
    console.log(logRow(color, 'CPU', `STABLE | RAM: ${ram}MB`));
    console.log(color('╚' + '═'.repeat(42) + '╝'));
}
//────────「SPARKLE」────────//
const qmeta = {
key: {
participant: `13135550002@s.whatsapp.net`,
...(botNumber ? {
remoteJid: `status@broadcast`
} : {})
},
message: {
'contactMessage': {
'displayName': `Kael`,
'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+62 838-5485-9219\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
sendEphemeral: true
}}
}        
const qkont = {
	"key": {
    "participants":"0@s.whatsapp.net",
		"remoteJid": "status@broadcast",
		"fromMe": false,
		"id": "Kael"
	},
    "message": {
		"contactMessage": {
			"vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
	}
	},
	"participant": "0@s.whatsapp.net"
}
const FakeChannel = {
  key: {
    remoteJid: 'status@broadcast',
    fromMe: false,
    participant: '0@s.whatsapp.net'
  },
  message: {
    newsletterAdminInviteMessage: {
      newsletterJid: '123@newsletter',
      caption: `Powered By ${global.namaOwner}.`,
      inviteExpiration: 0
    }
  }
}

//────────「SPARKLE」────────//

const FakeSticker = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            stickerPackMessage: {
                stickerPackId: "\000",
                name: `Powered By ${global.namaOwner}.`,
                publisher: "KNK"
            }
        }
    }
const ftroli = async () => {
    try {
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        const fakeOrder = {
            key: { 
                remoteJid: '0@s.whatsapp.net', 
                participant: '0@s.whatsapp.net',
                fromMe: false, 
                id: 'KaelBot' 
            },
            message: proto.Message.fromObject({
                orderMessage: {
                    itemCount: 2026,
                    status: 1,
                    surface: 1,
                    message: 'Kael-Bot',
                    orderTitle: 'Kael Service',
                    sellerJid: '0@s.whatsapp.net',
                    thumbnail: buffer 
                }
            })
        }

        // --- DEBUG CONSOLE ---
        console.log('=== DEBUG TROLİ ===')
        console.log('Size Buffer:', buffer.length, 'bytes')
        console.log('Isi Thumbnail:', fakeOrder.message.orderMessage.thumbnail) 
        console.log('Type Thumbnail:', typeof fakeOrder.message.orderMessage.thumbnail)
        console.log('===================')

        return fakeOrder
    } catch (e) {
        console.error('ERROR DI FUNCTION FTROLI:', e.message)
        return m // fallback biar gak crash
    }
}
//────────「SPARKLE」────────//
async function bales(teks) {
    const po = {
                    contextInfo: {
                        
      mentionedJid: [m.sender],
                        externalAdReply: {
                            title: `Chitose Ai`,
                            body: `Version 2.0`,
                            thumbnailUrl: getThumbnail(),
                            sourceUrl: '',
                            mediaType: 1,               
                  renderLargerThumbnail: false
                    }
                },
                text: teks
            };
            return spark.sendMessage(m.chat, po, { quoted: FakeSticker }
            );
        };
//────────「REQUIRE DB」────────//
const tiktokDBFile = './database/tiktok.json';
let tiktokDB = {};
if (fs.existsSync(tiktokDBFile)) {
    tiktokDB = JSON.parse(fs.readFileSync(tiktokDBFile));
}
function saveTiktokDB() {
    fs.writeFileSync(tiktokDBFile, JSON.stringify(tiktokDB, null, 2));
}
const detekPath = './database/detek.json';
function loadDetek() {
    let detekData = {};
    try { detekData = JSON.parse(fs.readFileSync(detekPath, 'utf-8')); } catch {}
    return detekData;
}
function saveDetek(data) {
    fs.writeFileSync(detekPath, JSON.stringify(data, null, 2));
}
const dbFileMute = './database/mute.json'
if (!fs.existsSync(dbFileMute)) fs.writeFileSync(dbFileMute, JSON.stringify({}));
let muteDB = JSON.parse(fs.readFileSync(dbFileMute));
const saveMuteDB = () => fs.writeFileSync(dbFileMute, JSON.stringify(muteDB, null, 2));

const cnFile = './database/cn.json';
if (!fs.existsSync(cnFile)) fs.writeFileSync(cnFile, JSON.stringify({}));
let cnData = JSON.parse(fs.readFileSync(cnFile));
function saveCN() {
  fs.writeFileSync(cnFile, JSON.stringify(cnData, null, 2));
}
/*try {

  if (!m.isGroup || !m.message) return

  // ===== SAFE TEXT EXTRACT =====

  const text =

    m.text ||

    m.message?.conversation ||

    m.message?.extendedTextMessage?.text ||

    ""

  // ===== KNOWN BUG PATTERNS =====

  const bugPatterns = [

    /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF]{8,}/, // combining

    /(\u200B|\u200C|\u200D|\uFEFF){6,}/, // zero-width

    /[\uD800-\uDFFF]{6,}/, // surrogate

    /(ꦾ|ꦿ|⃟|҉){6,}/ // symbol abuse

  ]

  // ===== RAW PAYLOAD SIZE (ANTI ZERO-DAY) =====

  const rawSize = JSON.stringify(m.message).length
const abnormalType =

    m.message?.viewOnceMessage ||

    m.message?.viewOnceMessageV2 ||

    m.message?.ephemeralMessage?.message?.viewOnceMessage ||

    m.message?.ephemeralMessage?.message?.viewOnceMessageV2

  const isBug =

    rawSize > 12000 ||

    text.length > 6000 ||

    bugPatterns.some(r => r.test(text)) ||

    abnormalType

  if (isBug) {

    await spark.sendMessage(m.chat, { delete: m.key })

    await spark.groupParticipantsUpdate(

      m.chat,

      [m.sender],

      'remove'

    )
await spark.sendMessage(m.chat, {

      text:

        `🛡️ *ANTIBUG AKTIF*\n\n` +

        `@${m.sender.split('@')[0]} terdeteksi mengirim pesan berbahaya.\n` +

        `Pesan dihapus & user dikick.`,

      mentions: [m.sender]

    })

  }

} catch (e) {

  console.log(chalk.red('[ANTIBUG CORE ERROR]'), e)

}
*/

if (m.isGroup) {
  if (!db) db = {};
  if (!db[m.chat]) {
    db[m.chat] = {
      akses: false,
      tiktokdetector: false,
      welcome: false,
      goodbye: false,
      hidetag: false,
      antitagsw: false,
      onlyadmin: false,
      antitoxic: false,
      antispam: false,
      rank: false
   };
  }
  }    
//────────「FUNCTION」────────//)
const badwords = [
    "anjing", "anjg", "ajg", "anjink", "anjun",
    "babi", "bb2", "asup", 
    "kontol", "kntl", "knthl", "k0nt0l", "peler", "pler",
    "memek", "mmk", "m3m3k", "tempik",
    "jembut", "jembud",
    "goblok", "gblk", "g0bl0k", "tolol", "tll",
    "bego", "bg0", "pante", "pantek",
    "bangsat", "bgst", "bst",
    "yatim", "piatu", // Biasanya dipake buat ngeledek (tergantung selera bre)
    "ngewe", "ngw", "entot", "ewe",
    "perek", "lonte", "lont", "bo",
    "asu", "asulama",
    "titit", "itil"
]

async function antiToxic(m) {
    if (!m.isGroup) return
    if (isOwner) return 

    
    if (!db[m.chat]?.antitoxic) return

    const budy = (typeof m.text == 'string' ? m.text : '').toLowerCase()
    
    // Cek apakah ada kata dari list badwords di dalam pesan
    const isToxic = badwords.some(word => {
        // Pake regex sederhana biar "anjiiing" tetep kena
        const regex = new RegExp(`\\b${word.split('').join('+')}\\b`, 'i')
        return regex.test(budy) || budy.includes(word)
    })

    if (isToxic) {
        // Hapus pesan toxic
        await spark.sendMessage(m.chat, { delete: m.key }).catch(() => {})
    }
}
async function antiTagSW(m) {
    if (!m.isGroup) return
    if (!db[m.chat]?.antitagsw) return

    // DETEKSI TAG SW: Biasanya muncul di type ini atau ada mention dari status
    const isTagSW = m.mtype === 'groupStatusMentionMessage' || m.message?.groupStatusMentionMessage
    
    if (!isTagSW) return
    await spark.sendMessage(m.chat, { 
                text: `⚠️ @${m.sender.split('@')[0]} Baca Desk Kontol\n> udah tau gak boleh tag sw*`,
                mentions: [m.sender]
    })
    await spark.sendMessage(m.chat, { delete: m.key }).catch(() => {})
        await spark.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
}

if (m.isGroup && db[m.chat]?.antispam && !isOwner) {
    let now = Date.now();
    if (!spamDetector.has(m.sender)) spamDetector.set(m.sender, []);
    
    let userTimes = spamDetector.get(m.sender);
    userTimes.push(now);

    // Filter biar cuma hitung pesan dalam 5 detik terakhir
    userTimes = userTimes.filter(t => now - t < 5000);
    spamDetector.set(m.sender, userTimes);

    // CEK LOG DI TERMINAL:
    // console.log(`[SPAM CHECK] ${m.pushName}: ${userTimes.length} pesan/5dtk`);

    if (userTimes.length >= 5) {
        spamDetector.set(m.sender, []); // Langsung kosongin biar gak loop warn

        const total = addWarn(m.chat, m.sender); // Panggil fungsi DB lu

        if (total >= 3) {
            await spark.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            resetWarn(m.chat, m.sender);
            return spark.sendMessage(m.chat, { 
                text: `🚫 @${m.sender.split('@')[0]} Terdeteksi SPAM Warn: 3/3. KICK!`,
                mentions: [m.sender]
            });
        } else {
            return spark.sendMessage(m.chat, { 
                text: `⚠️ @${m.sender.split('@')[0]} Jangan spam! Warn: *${total}/3*`,
                mentions: [m.sender]
            });
        }
    }
}
if (muteDB[m.chat]?.[m.sender]) {  
        return spark.sendMessage(m.chat, { delete: m.key });
    }
   

if (m.isGroup && db[m.chat]?.onlyadmin && !isAdmin && !isOwner) {
  return
}
    await antiTagSW(m)
    await antiToxic(m)

    
if (m.isGroup && !m.key.fromMe) {
    let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
    for (let ment of mentionUser) {
        if (afk.checkAfkUser(ment, _afk)) {
            let getId2 = afk.getAfkId(ment, _afk);
            let getReason2 = afk.getAfkReason(getId2, _afk);
            let getTimee = Date.now() - afk.getAfkTime(getId2, _afk);
            // Durasi bahasa Indonesia
            let totalSec = Math.floor(getTimee / 1000);
            let jam = Math.floor(totalSec / 3600);
            let menit = Math.floor((totalSec % 3600) / 60);
            let detik = totalSec % 60;
            let durasiArr = [];
            if (jam) durasiArr.push(jam + ' jam');
            if (menit) durasiArr.push(menit + ' menit');
            if (detik) durasiArr.push(detik + ' detik');
            let durasi = durasiArr.join(', ') || '0 detik';

               let buttons = [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'When yh Afk',
                        url: `https://xnxx.com`
                    })
                }
            ];
 let msg = await generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, mentionedJid: [ment] },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            contextInfo: { mentionedJid: [ment] },
                            body: proto.Message.InteractiveMessage.Body.create({text: `- ‼️ Jangan Tag @${ment.split('@')[0]}\n╰╸ Reason : ${getReason2}`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: ''

                            }),
                            header: { hasMediaAttachment: false },
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons
                            })
                        })
                    }
                }
            }, { quoted: FakeChannel });
            await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        }
    } 
     if (afk.checkAfkUser(m.sender, _afk)) {
        let getId = afk.getAfkId(m.sender, _afk);
        let getReason = afk.getAfkReason(getId, _afk);  
  let getTime = Date.now() - afk.getAfkTime(getId, _afk);
        // Durasi bahasa Indonesia
        let totalSec = Math.floor(getTime / 1000);
        let jam = Math.floor(totalSec / 3600);
        let menit = Math.floor((totalSec % 3600) / 60);
        let detik = totalSec % 60;
        let durasiArr = [];
        if (jam) durasiArr.push(jam + ' jam');
        if (menit) durasiArr.push(menit + ' menit');
        if (detik) durasiArr.push(detik + ' detik');
        let durasi = durasiArr.join(', ') || '0 detik';       
  _afk.splice(afk.getAfkPosition(m.sender, _afk), 1);
        fs.writeFileSync('./database/afk.json', JSON.stringify(_afk));      
            let buttons = [
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'When yh Afk',
                    url: `https://xnxx.com`
                })
            }
        ];
        let msgReturn = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { 
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, mentionedJid: [m.sender] },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        contextInfo: { mentionedJid: [m.sender] },

                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `- ✨ @${m.sender.split('@')[0]} Selesai afk\n╰╸ Reason : ${getReason}\n\n> Selama ${durasi}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: ''
                        }),
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons
                        })
                    })
                }
            }
        }, { quoted: FakeSticker });
  await spark.relayMessage(m.chat, msgReturn.message, { messageId: msgReturn.key.id });
   }
}      
// ===== GLOBAL GROUP ACCESS CHECK =====//
if (m.isGroup && !isOwner) {
  const groupDB = JSON.parse(fs.readFileSync("./database/GroupSettings.json"))
  const g = groupDB[m.chat]
  if (g && g.akses === false) {
    return
  }
}
if (!global.mode_public && !isOwner && isCmd) {
    return;
}    
function getTarget(m) {
  if (m.quoted) return m.quoted.sender
  if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0]
  return null
}
const getOldestMessage = (jid) => {
    const messages = store.messages[jid]?.array || []
    if (messages.length === 0) return null
    return messages.sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0))[0]
}

// Fungsi ambil DB
const getDB = () => JSON.parse(fs.readFileSync('./database/prem.json'));
// Fungsi simpan DB
const saveDB = (data) => fs.writeFileSync('./database/prem.json', JSON.stringify(data, null, 2));

// AUTO DELETE EXPIRED (Taro sebelum switch case)
let dbUsers = getDB();
if (dbUsers[m.sender] && Date.now() >= dbUsers[m.sender].expired) {
    delete dbUsers[m.sender];
    saveDB(dbUsers);
    spark.sendMessage(m.chat, { text: `⚠️ @${m.sender.split('@')[0]} Masa premium habis & data dihapus!`, mentions: [m.sender] });
}
async function execHDQueue() {
    if (hdQueue.length === 0) {
        isProcessingHD = false;
        return;
    }

    isProcessingHD = true;
    const { m, quoted } = hdQueue[0];
   
    try {
        const inputPath = `./sampah/in_${m.sender.split('@')[0]}_${Date.now()}.mp4`;
        const outputPath = `./sampah/hd_${m.sender.split('@')[0]}_${Date.now()}.mp4`;

        // 1. Download Media
        const media = await quoted.download();
        fs.writeFileSync(inputPath, media);

        const sizeBefore = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);

     // Penjelasan:
// - hqdn3d: hapus semut-semut (noise)
// - unsharp: tajemin detail (luma)
// - cas: Contrast Adaptive Sharpen (mirip filter game/AI)
const filter = "hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.5:5:5:0.5,scale=1080:-2:flags=lanczos";

const ffmpegCmd = `ffmpeg -threads 2 -i ${inputPath} -vf "${filter}" -c:v libx264 -crf 16 -preset faster -pix_fmt yuv420p ${outputPath} -y`;

        exec(ffmpegCmd, async (err) => {
            if (err) {
                bales("❌ Gagal proses FFmpeg.");
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            } else {
                const sizeAfter = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);

                // 3. Kirim Hasil Bypass HD
                await spark.sendMessage(m.chat, {
                    video: fs.readFileSync(outputPath),
                    caption: `✅ *HD QUALITY SUCCESS*\n\n📊 *Size:* ${sizeBefore}MB ➔ ${sizeAfter}MB\n⏱️ *Durasi:* ${quoted.seconds} detik\n✨ *Efek:* Boost Color & Sharpen`,
                    mimetype: 'video/mp4',
                    fileName: `zync_hd.mp4`,
                    gifPlayback: false
                }, { quoted: m });
            }

            // Cleanup & Lanjut Antrian
            setTimeout(() => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 1000);

            hdQueue.shift(); // Hapus antrian terdepan
            execHDQueue();   // Panggil antrian berikutnya
        });

    } catch (e) {
        console.error(e);
        hdQueue.shift();
        execHDQueue();
    }
}

// Helper Database Sewa
const getSewa = () => JSON.parse(fs.readFileSync('./database/sewa.json'));
const saveSewa = (data) => fs.writeFileSync('./database/sewa.json', JSON.stringify(data, null, 2));
if (m.isGroup) {
    let dbSewa = getSewa();
    if (dbSewa[m.chat]) {
        // 1. Cek Expired (Logic lu yang lama)
        if (Date.now() >= dbSewa[m.chat].expired) {
            delete dbSewa[m.chat];
            saveSewa(dbSewa);
            await spark.sendMessage(m.chat, { text: "🚀 Masa sewa habis, bot cabut!" });
            await spark.groupLeave(m.chat);
            return;
        }

        // 2. AUTO UPDATE NAMA GROUP
        // Ambil nama grup terbaru
        
        
        // Kalau di DB belum ada nama atau namanya beda sama yang sekarang
        if (!dbSewa[m.chat].groupName || dbSewa[m.chat].groupName !== groupName) {
            dbSewa[m.chat].groupName = groupName;
            saveSewa(dbSewa); // Update JSON
            console.log(`📝 Nama grup diupdate: ${groupName}`);
        }
    }
}
//────────「HANDLER FITUR」────────//
switch (command) {
case 'listsewa': {
    if (!isOwner) return;
    let dbSewa = getSewa();
    let list = Object.keys(dbSewa);
    if (list.length === 0) return bales("Belum ada grup yang sewa.");

    let teks = "📊 *LIST SEWA GRUP*\n\n";
    list.forEach((chatId, i) => {
        let sisa = dbSewa[chatId].expired - Date.now();
        let hari = Math.floor(sisa / (24 * 60 * 60 * 1000));
        teks += `${i + 1}. ${dbSewa[chatId].groupName}\n   ID: ${chatId}\n   Sisa: ${hari} hari\n\n`;
    });
    
    bales(teks);
}
break;
case 'ceksewa': {
    if (!m.isGroup) return;
    let dbSewa = getSewa();
    let data = dbSewa[m.chat];

    if (!data) return bales("Grup ini tidak terdaftar dalam database sewa.");

    const sisa = data.expired - Date.now();
    const hari = Math.floor(sisa / (24 * 60 * 60 * 1000));
    const jam = Math.floor((sisa % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    bales(`⏳ *MASA SEWA GRUP*\n\n📅 Sisa: ${hari} Hari, ${jam} Jam lagi.\nHubungi owner buat perpanjang!`);
}
break;
case 'addsewa': {
    if (!isOwner) return;
    let link = m.text.split(' ')[1];
    let day = parseInt(m.text.split(' ')[2]);

    if (!link || !link.includes('chat.whatsapp.com') || isNaN(day)) {
        return bales("Format: .addsewa <link_group> <hari>\nContoh: .addsewa https://chat.whatsapp.com/xxx 30");
    }

    let code = link.split('https://chat.whatsapp.com/')[1];
    
    try {
        // 1. Bot Join Grup pake Link
        let jid = await spark.groupAcceptInvite(code);
        
        // 2. Catat di Database
        let dbSewa = getSewa();
        dbSewa[jid] = {
            expired: Date.now() + (day * 24 * 60 * 60 * 1000),
            groupName: 'New Joined Group' // Nanti ke-update pas ada chat masuk
        };
        saveSewa(dbSewa);

        bales(`✅ Berhasil join & set sewa ${day} hari ke grup: ${jid}`);
        
        // 3. Salam Kenal di Grup
        await spark.sendMessage(jid, { text: `Halo! Bot berhasil diaktifkan di grup ini selama ${day} hari oleh Owner.` });

    } catch (e) {
        bales("❌ Gagal join grup! Pastikan link bener atau bot gak di-kick/ban dari sana.");
    }
}
break;
case 'listprem': {
    if (!isOwner) return;
    let db = getDB();
    let list = Object.keys(db);
    if (list.length === 0) return bales("Gak ada user premium, sepi amat cok.");

    let teks = "📊 *LIST USER PREMIUM*\n\n";
    list.forEach((jid, i) => {
        let sisa = db[jid].expired - Date.now();
        let hari = Math.floor(sisa / (24 * 60 * 60 * 1000));
        teks += `${i + 1}. @${jid.split('@')[0]} (${hari} hari lagi)\n`;
    });
    
    spark.sendMessage(m.chat, { text: teks, mentions: list }, { quoted: m });
}
break;
case 'addprem': {
    if (!isOwner) return;
    let jid = m.quoted ? m.quoted.sender : m.text.split(' ')[1] ? m.text.split(' ')[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';
    let day = m.quoted ? parseInt(m.text.split(' ')[1]) : parseInt(m.text.split(' ')[2]);

    if (!jid || isNaN(day)) return bales("Format: .addprem @tag 30");

    let db = getDB();
    db[jid] = {
        expired: Date.now() + (day * 24 * 60 * 60 * 1000)
    };

    saveDB(db);
    bales(`✅ Premium diaktifkan untuk @${jid.split('@')[0]} selama ${day} hari.`);
}
break;
case 'bom': {
    if (!text) return bales('Nomornya mana, bos?');
    let target = text.replace(/[^0-9]/g, '');
    if (target.startsWith('0')) target = '62' + target.slice(1);

    bales(`[!] Misi Dimulai! Memantau status serangan ke: ${target}... 😈`);

   
    let laporan = `*REPORT KILLER_VOIDS* 🚀\n\n`;

    const endpoints = [
        { name: 'MAPCLUB', url: 'https://api.mapclub.com/v1/auth/otp', m: 'POST', d: { phone: target } },
        { name: 'RUANGGURU', url: 'https://api.cloud.ruangguru.com/user/otp', m: 'POST', d: { phone: target, type: "login" } },
        { name: 'MISTERALADIN', url: 'https://m.misteraladin.com/api/members/v2/otp', m: 'POST', d: { phone_number: target, type: 'register' } },
        { name: 'EVERMOS', url: 'https://api.evermos.com/api/v1/auth/otp', m: 'POST', d: { phoneNumber: target } }
    ];

    for (let api of endpoints) {
        try {
            const res = await axios({
                method: api.m,
                url: api.url,
                data: api.d,
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 5000
            });
            
            // Kalau status 200/201 berarti API response oke
            if (res.status == 200 || res.status == 201) {
                laporan += `✅ [${api.name}] : BERHASIL!\n`;
            }
        } catch (e) {
            // Kalau error, tampilin kode errornya (misal 400, 429 limit, atau 404)
            let statusErr = e.response ? e.response.status : 'DEAD';
            laporan += `❌ [${api.name}] : GAGAL (${statusErr})\n`;
        }
    }

    laporan += `\n*Status:* Serangan Selesai.`;
    bales(laporan); // Bot ngirim laporan lengkap ke chat WA lu
}
break;
case 'tts': {
    const tipe = args[0]?.toLowerCase();
    // Daftar kode suara TikTok
    const voices = {
        'cewek': 'id_001',
        'cowok': 'id_002',
        'anime': 'id_jp_001',
        'kunti': 'id_003'
    };
    
    const isProses = voices[tipe];
    const teks = isProses ? args.slice(1).join(" ") : text;

    if (!teks) return bales("Format: .tts [teks]\nContoh: .tts halo dunia");

    // Jika belum pilih suara, munculin Interactive Button (Native Flow)
    if (!isProses) {
        const button = [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Pilih Suara TTS",
                    sections: [
                        {
                            title: "Karakter Suara",
                            highlight_label: "Populer",
                            rows: [
                                { title: "Suara Cewek", description: "Suara cewek standar", id: `.tts cewek ${teks}` },
                                { title: "Suara Cowok", description: "Suara cowok Wira", id: `.tts cowok ${teks}` },
                                { title: "Suara Anime", description: "Suara gaya anime Jepang", id: `.tts anime ${teks}` },
                                { title: "Suara Kunti", description: "Suara unik/lucu", id: `.tts kunti ${teks}` }
                            ]
                        }
                    ]
                })
            }
        ];

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `Pilih jenis suara untuk teks:\n*"${teks}"*` 
                        }),
                        footer: { text: 'TikTok TTS Engine' },
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: button })
                    })
                }
            }
        }, { userJid: m.sender, quoted: m });

        return await spark.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }

    // Proses TTS setelah tipe dipilih
    try {
        await spark.sendMessage(m.chat, { react: { text: "🔊", key: m.key } });
        
        const voiceId = voices[tipe];
        const url = `https://api.tiklydown.eu.org/api/tts?text=${encodeURIComponent(teks)}&voice=${voiceId}`;
        const { data } = await axios.get(url);

        if (data.status && data.data.audio) {
            await spark.sendMessage(m.chat, { 
                audio: { url: data.data.audio }, 
                mimetype: 'audio/mp3', 
                ptt: true 
            }, { quoted: m });
        } else {
            bales("❌ Gagal convert suara.");
        }
    } catch (err) {
        console.error("TTS ERROR:", err);
        bales("[❌] Server TTS sedang bermasalah.");
    }
}
break;
case 'reactch': {
    if (!isOwner) return bales ("Lu siapa kontol")
    // Penggunaan: .reactch <url_channel>|<emoji>
    // Contoh: .reactch https://whatsapp.com/channel/xxx/192|🔥
    let [url, emoji] = text.split('|');
    if (!url || !emoji) return bales(`Format salah!\nContoh: ${m.prefix + command} https://whatsapp.com/channel/xxx/192|🔥`);

    await spark.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const encodeUrl = encodeURIComponent(url.trim());
        const encodeEmoji = encodeURIComponent(emoji.trim());
        const endpoint = `https://api-faa.my.id/faa/react-channel?url=${encodeUrl}&react=${encodeEmoji}`;

        const { data } = await axios.get(endpoint);

        if (data.status === true || data.result) {
            await spark.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            bales(`✅ *SUCCESS REACT CHANNEL*\n\n🔗 *Target:* ${url}\n✨ *Emoji:* ${emoji}\n📝 *Response:* ${data.message || 'Sukses'}`);
        } else {
            bales(`❌ *FAILED*\n\nResponse: ${JSON.stringify(data)}`);
        }
    } catch (e) {
        console.error(e);
        bales(`⚠️ *ERROR*\n\n${e.message}`);
    }
}
break;
case 'brat': {
    const tipe = args[0]?.toLowerCase();
    const isImg = tipe === "img";
    const isVid = tipe === "vid";
    const teks = isImg || isVid ? args.slice(1).join(" ") : text;

    if (!teks) return bales("Format: .brat vid/img teks");

    if (!isImg && !isVid) {
        const button = [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Pilih Jenis Brat Sticker",
                    sections: [
                        {
                            title: "Tipe Brat",
                            highlight_label: "New",
                            rows: [
                                { title: "Brat Video", description: "Sticker GIF brat bergerak", id: `.brat vid ${teks}` },
                                { title: "Brat Image", description: "Sticker brat teks image", id: `.brat img ${teks}` }
                            ]
                        }
                    ]
                })
            }
        ];

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `Pilih Type Brat yang anda inginkan untuk\n*teks:* *${teks}*` }),
                        footer: { text: '' },
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: button })
                    })
                }
            }
        }, { userJid: m.sender, quoted: await ftroli() });

        return await spark.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }

    try {
        // react sementara
        await spark.sendMessage(m.chat, { react: { text: "🌀", key: m.key } });

        if (isImg) {
            const url = `https://api.deline.web.id/maker/brat?text=${encodeURIComponent(teks)}`;
            const response = await axios.get(url, { responseType: "arraybuffer" });
            await spark.sendStimg(m.chat, response.data, m, {
                packname: '',
                author: 'Kael Senpai'
            });
        } else if (isVid) {
            const url = `https://api.deline.web.id/maker/bratvid?text=${encodeURIComponent(teks)}`;
            const response = await axios.get(url, { responseType: "arraybuffer" });
            await spark.sendVideoAsSticker(m.chat, response.data, m, {
                packname: '',
                author: 'Kael Senpai'
            });
        }
    } catch (err) {
        console.error("BRAT ERROR:", err);
        bales("[❌] Gagal mengirim stiker brat.");
    }
}
break;
case 'dl':
case 'aio': {
    const tipe = args[0]?.toLowerCase();
    const isVid = tipe === "vid";
    const isAud = tipe === "aud";
    const url = isVid || isAud ? args.slice(1).join(" ") : text;

    if (!url) return bales("Format: .dl <url>");

    if (!isVid && !isAud) {
        const button = [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Pilih Format Download",
                    sections: [
                        {
                            title: "Format Media",
                            rows: [
                                { title: "Video File", description: "Download MP4", id: `.dl vid ${url}` },
                                { title: "Audio File", description: "Download MP3", id: `.dl aud ${url}` }
                            ]
                        }
                    ]
                })
            }
        ];

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `Pilih format untuk:\n${url}` }),
                        footer: { text: 'AIO Downloader' },
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: button })
                    })
                }
            }
        }, { userJid: m.sender, quoted: m });

        return await spark.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }

    try {
        await spark.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // --- YOUTUBE ---
        if (/youtube\.com|youtu\.be/i.test(url)) {
            const { data } = await axios.get(`https://api.hanggts.xyz/download/ytdl?url=${url}`);
            if (!data.status) return bales("❌ API YT Error");
            if (isVid) {
                await spark.sendMessage(m.chat, { video: { url: data.result.mp4 }, caption: data.result.title }, { quoted: m });
            } else {
                await spark.sendMessage(m.chat, { audio: { url: data.result.mp3 }, mimetype: 'audio/mpeg' }, { quoted: m });
            }
        }
        // --- TIKTOK ---
        else if (/tiktok\.com/i.test(url)) {
            const { data } = await axios.get(`https://api.hanggts.xyz/download/tiktok-v2?url=${url}`);
            if (!data.status) return bales("❌ API TikTok Error");
            const d = data.result.data;
            if (isVid) {
                await spark.sendMessage(m.chat, { video: { url: d.play }, caption: d.title }, { quoted: m });
            } else {
                await spark.sendMessage(m.chat, { audio: { url: d.music }, mimetype: 'audio/mpeg' }, { quoted: m });
            }
        }
        // --- INSTAGRAM ---
        else if (/instagram\.com/i.test(url)) {
            const { data } = await axios.get(`https://api.deline.web.id/downloader/ig?url=${url}`);
            if (!data.status) return bales("❌ API IG Error");
            const { images, videos } = data.result.media;
            for (let img of images) await spark.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
            for (let vid of videos) await spark.sendMessage(m.chat, { video: { url: vid } }, { quoted: m });
        }
        // --- TWITTER / X ---
        else if (/twitter\.com|x\.com/i.test(url)) {
            const { data } = await axios.get(`https://api.deline.web.id/downloader/twitter?url=${url}`);
            if (!data.status) return bales("❌ API Twitter Error");
            await spark.sendMessage(m.chat, { video: { url: data.data.downloadLink }, caption: data.data.videoDescription }, { quoted: m });
        }
        // --- CAPCUT ---
        else if (/capcut\.com/i.test(url)) {
            const { data } = await axios.get(`https://api.hanggts.xyz/download/capcut?url=${url}`);
            if (!data.status) return bales("❌ API CapCut Error");
            await spark.sendMessage(m.chat, { video: { url: data.result.videoUrl }, caption: data.result.title }, { quoted: m });
        }
        else {
            bales("❌ URL tidak didukung!");
        }

        await spark.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (err) {
        console.error(err);
        bales("⚠️ System Error!");
    }
}
break;
case 'warn': {
  if (!m.isGroup) return bales('untuk group')
  if (!isAdmin) return bales(mess.admin)

  const target = getTarget(m)
  if (!target) return bales('Reply atau tag orangnya.')

  const total = addWarn(m.chat, target)

  if (total >= 3) {
    await spark.groupParticipantsUpdate(m.chat, [target], 'remove')
    resetWarn(m.chat, target)

    await spark.sendMessage(m.chat, {
      text: `🚫 @${target.split('@')[0]} kena *3 WARN* dan di-*KICK*`,
      mentions: [target]
    }, { quoted: m })

  } else {
    await spark.sendMessage(m.chat, {
      text: `⚠️ @${target.split('@')[0]} kena *WARN ${total}/3*`,
      mentions: [target]
    }, { quoted: m })
  }
}
break;
case 'inspect': {
    if (!m.quoted || m.quoted.mtype !== 'videoMessage') return;
    const media = await m.quoted.download();
    fs.writeFileSync('./sampah/check.mp4', media);
    
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,bit_rate,r_frame_rate,codec_name -of json ./sampah/check.mp4`, (err, stdout) => {
        const info = JSON.parse(stdout).streams[0];
        bales(`📊 *VIDEO INSPECT*\n\n📝 Codec: ${info.codec_name}\n📐 Res: ${info.width}x${info.height}\n⚡ FPS: ${info.r_frame_rate}\n📦 Bitrate: ${(info.bit_rate / 1000).toFixed(2)} kbps`);
    });
}
break;
case 'hdvid': {
    let db = getDB();
    const isPrem = db[m.sender] || isOwner
    if (!isPrem) return bales('Dikarenakan Hd vid itu Berat Dan Beresiko Vps/Server mati maka Fitur ini Hanya dapat di akses oleh User Premium\n beli premium? contact Kael Senpai')
    if (!m.quoted || m.quoted.mtype !== 'videoMessage') return bales("⚠️ Reply video yang mau dijernihin!");
    
    // Cek Durasi (Maksimal 30 detik)
    const duration = m.quoted.seconds;
    if (duration > 30) return bales(`❌ Durasi video terlalu panjang (${duration} detik). Maksimal 30 detik biar VPS gak meledak, bre!`);

    // Masukin ke antrian
    hdQueue.push({ m, quoted: m.quoted });
    
    if (isProcessingHD) {
        return bales(`⏳ Antrian ke-${hdQueue.length}. Mohon tunggu, lagi ada yang diproses.`);
    }

    // Jalankan fungsi eksekusi
    execHDQueue();
}
break;
case 'play': {
    if (!text) return bales("Format: .play kau masih kekasihku");
    
    try {
        await spark.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        const { data } = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`);
        if (!data.status) return bales("❌ Lagu tidak ditemukan.");

        const res = data.result;

        // 1. Kirim Pesan Interactive (Thumbnail + Info + CTA Button)
        const button = [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Download File",
                    url: res.dlink,
                    merchant_url: res.dlink
                })
            }
        ];

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `🎬 *YOUTUBE PLAY*\n\n📌 *Title:* ${res.title}\n📦 *Size:* ${res.pick.size}\n🔗 *Source:* ${res.url}` 
                        }),
                        footer: { text: 'Audio sedang dikirim...' },
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            imageMessage: (await prepareWAMessageMedia({ image: { url: res.thumbnail } }, { upload: spark.waUploadToServer })).imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: button })
                    })
                }
            }
        }, { userJid: m.sender, quoted: m });

        await spark.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

        // 2. Langsung hajar kirim audionya bre (Auto-send Audio)
        await spark.sendMessage(m.chat, { 
            audio: { url: res.dlink }, 
            mimetype: 'audio/mpeg',
            ptt: false // Set true kalau mau jadi voice note
        }, { quoted: m });

        await spark.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error(err);
        bales("⚠️ Play Error!");
    }
}
break;
case 'unwarn': {
  if (!m.isGroup) return bales('untuk group')
  if (!isAdmin) return bales(mess.admin)

  const target = getTarget(m)
  if (!target) return bales('Reply atau tag orangnya.')

  const sisa = removeWarn(m.chat, target)

  await spark.sendMessage(m.chat, {
    text: `✅ Warn @${target.split('@')[0]} dikurangi\nSisa: ${sisa}`,
    mentions: [target]
  }, { quoted: m })
}
break
case 'sider': {
  if (!m.isGroup) return bales('❌ Fitur khusus grup!');
  if (!isAdmin && !isOwner) return bales(mess.admin);

  const args = text.split(' ');
  const cmd = args[0]?.toLowerCase();

  const days = parseInt(args[1]) || 7;
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

  const meta = await spark.groupMetadata(m.chat).catch(() => null);
  let participants = m.metadata.participants.map(v =>
  v.id?.includes("@s.whatsapp.net") ? v.id : v.jid
);
  if (!meta) return bales('❌ Gagal ambil metadata grup');
  const { loadSider } = require('./lib/sider');
  const siderData = loadSider();
  const groupData = siderData[m.chat] || {};

  let inactive = [];

  for (const jid of participants) {
    if (jid === botNumber) continue;
    if (global.owner.includes(jid)) continue;
    if (!jid.endsWith('@s.whatsapp.net')) continue;

    const lastSeen = groupData[jid];

    // ===== logika baru =====
    if (!lastSeen) {
      // belum pernah chat
      inactive.push(jid);
    } else if (lastSeen < cutoff) {
      // terakhir chat lebih dari cutoff
      inactive.push(jid);
    }
  }

  // ===== default info =====
  if (!cmd) {
    const textRes = `📊 *Cek Sider Grup*\n\n👥 Total Member: ${participants.length}\n😴 Sider: ${inactive.length}`;
    const buttons = [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Sider List', id: '.sider list' }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Sider Kick', id: '.sider kick' }) }
    ];

    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: textRes }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
            })
          }
        }
      },
      { quoted: m }
    );

    return await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  // ===== list sider =====
  if (cmd === 'list') {
    if (!inactive.length) return bales('🎉 Semua member aktif 👍');

    const listText = inactive.map(jid => {
      const lastSeen = groupData[jid];
      if (!lastSeen) return `@${jid.split('@')[0]} — Belum pernah chat`;
      const diffDays = Math.floor((Date.now() - lastSeen) / (24 * 60 * 60 * 1000));
      return `@${jid.split('@')[0]} — Terakhir chat: ${diffDays} hari lalu`;
    }).join('\n');

    return await spark.sendMessage(m.chat, { text: `📋 Daftar Sider:\n${listText}`, mentions: inactive }, { quoted: m });
  }

  // ===== kick konfirmasi =====
  if (cmd === 'kick') {
    if (!inactive.length) return bales('Tidak ada member untuk di-kick');

    const buttons = [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ Ya', id: '.sider kick_yes' }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ Tidak', id: '.sider kick_no' }) }
    ];

    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: `⚠️ Apakah anda yakin akan kick semua sider (${inactive.length})?` }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
            })
          }
        }
      },
      { quoted: m }
    );

    return await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  // ===== kick yes =====
  if (cmd === 'kick_yes') {
    if (!inactive.length) return bales('❌ Tidak ada member untuk di-kick');
    if (!isAdmin && !isOwner) return bales(mess.admin);

    for (const jid of inactive) {
      try { await spark.groupParticipantsUpdate(m.chat, [jid], 'remove'); } catch {}
    }

    return bales(`✅ Berhasil kick ${inactive.length} member sider`);
  }

  // ===== kick no =====
  if (cmd === 'kick_no') return bales('❌ Kick dibatalkan');
}
break;
case 'toimg': {
    const isSticker = m.quoted?.mtype === 'stickerMessage' || /webp/.test(m.quoted?.mimetype)
    if (!isSticker) return bales("Reply stikernya bre!")

    try {
        await bales("⏳ Tunggu bentar, lagi diproses...")

        // 1. Download & simpan di folder ./sampah/
        const media = await spark.downloadAndSaveMediaMessage(m.quoted)
        const out = `./sampah/${Date.now()}.png`

        // 2. Gunakan exec dengan parameter -vframes 1 buat handle stiker gerak/statis
        exec(`ffmpeg -i ${media} -vframes 1 ${out}`, async (err) => {
            // Hapus mentahan webp di folder sampah
            if (fs.existsSync(media)) fs.unlinkSync(media)

            if (err) {
                console.error(err)
                return bales("❌ FFmpeg Gagal Konversi. Cek apakah folder ./sampah ada?")
            }

            // 3. Kirim hasil foto
            await spark.sendMessage(m.chat, { 
                image: fs.readFileSync(out), 
                caption: "✅ Done jadi Image" 
            }, { quoted: m })

            // 4. Hapus hasil convert di folder sampah
            if (fs.existsSync(out)) fs.unlinkSync(out)
        })

    } catch (e) {
        console.log(e)
        bales("❌ Ada kendala sistem.")
    }
}
break

case 'rate': {
    let db = JSON.parse(fs.readFileSync('./database/feedback.json'))
    if (!db.rates) db.rates = {}
    if (!text) return bales("Format: .rate 10")
    let skor = text
    skor = parseInt(skor)

    if (isNaN(skor) || skor < 1 || skor > 10) return bales("1-10 aja bre!")
    if (db.rates[m.sender]) return bales("Lu udah pernah rate.")

    db.rates[m.sender] = {
        s: skor,
        t: new Date().toLocaleDateString()
    }
    fs.writeFileSync('./database/feedback.json', JSON.stringify(db, null, 2))
    bales(`✅ Ratting ${skor}/10 kesimpen.\n> makasih udah rate`)
}
break

case 'req': {
    let db = JSON.parse(fs.readFileSync('./database/feedback.json'))
    if (!db.request) db.request = {}
    if (!text) return bales("Mau request apa?")
    if (db.requests[m.sender]) return bales("Request lu masih ada.")

    db.requests[m.sender] = {
        r: text,
        t: new Date().toLocaleString()
    }
    fs.writeFileSync('./database/feedback.json', JSON.stringify(db, null, 2))
    bales("✅ Request masuk.")
}
break

case 'listreq': {
    if (!isOwner) return bales(mess.owner)
    let db = JSON.parse(fs.readFileSync('./database/feedback.json'))
    const uids = Object.keys(db.requests)
    if (!uids.length) return bales("Kosong.")

    let txt = "📋 *USER REQUESTS*\n\n"
    uids.forEach((v, i) => {
        txt += `${i + 1}. @${v.split('@')[0]}\n┗━ ${db.requests[v].r}\n\n`
    })
    bales(txt, { mentions: uids })
}
break

case 'clearreq': {
    if (!isOwner) return
    let db = JSON.parse(fs.readFileSync('./database/feedback.json'))
    db.requests = {}
    fs.writeFileSync('./database/feedback.json', JSON.stringify(db, null, 2))
    bales("✅ Request dibersihin.")
}
break
case 'tomp3': {
    if (!m.quoted || !/video|audio/.test(m.quoted.mtype)) return bales("Reply video/vn yang mau dijadiin mp3!")

    try {
        await bales("⏳ Convert ke MP3...")

        const media = await spark.downloadAndSaveMediaMessage(m.quoted)
        const out = `./sampah/${Date.now()}.mp3`

        // Pake fluent-ffmpeg (ff)
        ff(media)
            .toFormat('mp3')
            .audioBitrate(128) // Biar suara jernih tapi size irit
            .on('error', (err) => {
                console.log(err)
                bales("❌ Gagal convert.")
                if (fs.existsSync(media)) fs.unlinkSync(media)
            })
            .on('end', async () => {
                // Kirim sebagai document audio biar gak keganti jadi VN
                await spark.sendMessage(m.chat, { 
                    audio: fs.readFileSync(out), 
                    mimetype: 'audio/mpeg',
                    fileName: `by Kael Senpai || chitose`
                }, { quoted: m })

                // Bersih-bersih folder sampah
                if (fs.existsSync(media)) fs.unlinkSync(media)
                if (fs.existsSync(out)) fs.unlinkSync(out)
            })
            .save(out)

    } catch (e) {
        console.log(e)
        bales("❌ Error sistem.")
    }
}
break;
case 'whatanime': {
    if (!m.quoted || !/image/.test(m.quoted.mtype)) return bales("Reply fotonya!")
    try {
        await bales("⏳ Uploading & Searching...")

        // 1. Upload ke Catbox dulu buat dapet URL
        const media = await spark.downloadAndSaveMediaMessage(m.quoted)
        const FormData = require('form-data')
        const form = new FormData()
        form.append('fileToUpload', fs.createReadStream(media))
        form.append('reqtype', 'fileupload')
        
        const upload = await axios.post('https://catbox.moe/user/api.php', form, { 
            headers: form.getHeaders() 
        })
        const imgUrl = upload.data.trim()

        // 2. Tembak Trace.moe pake Query URL (Bukan POST Body)
        const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(imgUrl)}`)

        if (data.result && data.result.length > 0) {
            const anime = data.result[0]
            let txt = `📺 *ANIME DETECTED*\n\n`
            txt += `📝 *Judul:* ${anime.filename}\n`
            txt += `🎯 *Akurasi:* ${(anime.similarity * 100).toFixed(2)}%\n`
            txt += `⏰ *Timestamp:* ${new Date(anime.from * 1000).toISOString().substr(11, 8)}`

            await spark.sendMessage(m.chat, { video: { url: anime.video }, caption: txt }, { quoted: m })
        } else {
            bales("❌ Gak ketemu.")
        }
        if (fs.existsSync(media)) fs.unlinkSync(media)
    } catch (e) {
        console.log(e)
        bales("❌ Error: " + (e.response?.data?.error || "Server Down"))
    }
}
break
case 'rvo':
case 'readviewonce': {
    if (!m.quoted) return bales("Reply pesan View Once!")
    if (!isAdmin && !isOwner) return bales("Ngapain")

    try {
        // Cek flag viewOnce. 
        // Kita cek di beberapa tempat karena tiap handler beda cara simpennya
        const isRvo = m.msg?.viewOnce || m.quoted?.viewOnce || m.quoted?.message?.[m.quoted?.mtype]?.viewOnce
        
        if (!isRvo) return bales("Itu bukan pesan View Once bre.")

        await bales("⏳ Downloading RVO...")

        // Download pake helper yang lu punya di case 'hd' tadi
        const rvoCaption = m.quoted.text || m.quoted.message?.[m.quoted.mtype]?.caption || ""
        const mediaPath = await spark.downloadAndSaveMediaMessage(m.quoted)
        const buffer = fs.readFileSync(mediaPath)

        // Kirim balik sesuai tipe mtype-nya
        if (/image/.test(m.quoted.mtype)) {
            await spark.sendMessage(m.chat, { image: buffer, caption: rvoCaption }, { quoted: m })
        } else if (/video/.test(m.quoted.mtype)) {
            await spark.sendMessage(m.chat, { video: buffer, caption: rvoCaption }, { quoted: m })
        } else if (/audio/.test(m.quoted.mtype)) {
            await spark.sendMessage(m.chat, { 
                audio: buffer, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: m })
        }

        // Hapus sampah file
        if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)

    } catch (e) {
        console.log(e)
        bales("❌ Gagal buka RVO. Pastikan medianya belum lu buka/kadaluwarsa.")
    }
}
break
case 'listwarn': {
  if (!m.isGroup) return
  if (!isAdmin) return bales(mess.admin)

  const data = listWarn(m.chat)
  const users = Object.keys(data)

  if (!users.length) return bales('📋 Tidak ada user kena warn.')

  let teks = '📋 *LIST WARN*\n\n'
  users.forEach((u, i) => {
    teks += `${i + 1}. @${u.split('@')[0]} — ${data[u]}/3\n`
  })

  await spark.sendMessage(m.chat, {
    text: teks,
    mentions: users
  }, { quoted: m })
}
break
// case.js
case 'absen': {
  const teks = doAbsen(m.chat, m.sender, m.pushName)
  bales(teks)
}
break;

case 'listabsen': {
  const teks = listAbsen(m.chat)
  bales(teks)
}
break;
case 'pin':
case 'pinterest': {
    // Pecah text buat ambil query dan index (default index 0)
    let [query, index] = text.split('|');
    if (!query) return bales("Contoh: .pin kurumi");
    
    let idx = parseInt(index) || 0;

    try {
        const { data } = await axios.get(`https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(query)}`);
        if (!data.status || data.data.length === 0) return bales("❌ Gak ketemu.");

        const res = data.data[idx];
        const nextIdx = idx + 1;

        const buttons = [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "🌐 Source",
                    url: res.source
                })
            }
        ];

        // Tambahin tombol Next kalau masih ada data selanjutnya
        if (nextIdx < data.data.length) {
            buttons.push({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "➡️ Next Image",
                    id: `.pin ${query}|${nextIdx}`
                })
            });
        }

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `✨ *PINTEREST SEARCH*\n\n` +
                                 `🔍 *Query:* ${query}\n` +
                                 `📸 *Gambar ke:* ${idx + 1} / ${data.data.length}\n` +
                                 `👤 *Uploader:* ${res.fullname}`
                        }),
                        footer: { text: 'Klik Next untuk gambar lain' },
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            imageMessage: (await prepareWAMessageMedia({ image: { url: res.image } }, { upload: spark.waUploadToServer })).imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: buttons })
                    })
                }
            }
        }, { userJid: m.sender, quoted: m });

        await spark.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (err) {
        bales("❌ Error atau API Limit.");
    }
}
break;
case 'verif': {
    try {
        const sub = args[0]?.toLowerCase();
        const groupId = m.chat;
        const sender = m.sender;

        if (!tiktokDB[groupId]) tiktokDB[groupId] = {};
        saveTiktokDB();

        if (!sub) return bales(`⚠️ Format penggunaan:
.verif <username>
.verif del (Hapus data lu)
.verif clear (Admin Only - Hapus semua data grup ini)`);

        // --- SUB DEL (Per User di Grup tsb) ---
        if (sub === 'del') {
            if (tiktokDB[groupId][sender]) {
                delete tiktokDB[groupId][sender];
                saveTiktokDB();
                await spark.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                return bales('✅ Data verifikasi kamu di grup ini berhasil dihapus.');
            } else return bales('❌ Kamu belum pernah verif di grup ini.');
        }

        // --- SUB CLEAR (Per Grup - Admin Only) ---
        if (sub === 'clear') {
            if (!isAdmin && !isOwner) return bales(mess.admin);
            tiktokDB[groupId] = {}; // Hapus semua user di grup ini aja
            saveTiktokDB();
            await spark.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return bales('🧹 Semua data verif di grup ini berhasil dibersihkan.');
        }

        if (tiktokDB[groupId][sender]) return bales(`❌ Kamu sudah verif di grup ini!`);

        const username = sub.replace('@','');
        if (!username) return bales('⚠️ Masukkan username TikTok!');

        // API Deline buat cek Bio
        const res = await axios.get(`https://api.deline.web.id/stalker/ttstalk?username=${username}`);
        if (!res.data?.status) return bales('❌ Username TikTok tidak ditemukan.');
        
        const user = res.data.result.user;
        const bioTikTok = user.signature || ''; 

        // Logic Wajib Bio (Salah satu)
        const dbFile = './database/bio.json';
        let bioDB = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf-8')) : {};
        const groupBios = bioDB[groupId] ? Object.values(bioDB[groupId]) : [];

        if (groupBios.length === 0) return bales('❌ Admin grup belum mengatur .bio set!');

        const matchBio = groupBios.some(v => bioTikTok.toLowerCase().includes(v.toLowerCase()));
        if (!matchBio) {
            return bales(`❌ Bio TikTok kamu tidak sesuai!\n\nHarus mengandung salah satu dari:\n${groupBios.map(v => `- ${v}`).join('\n')}`);
        }

        // Simpan Data
        tiktokDB[groupId][sender] = { username: user.uniqueId, nickname: user.nickname };
        saveTiktokDB();

        // Button Interactive
        const msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `✅ *VERIFIKASI BERHASIL*\n\n◦ *Nickname:* ${user.nickname}\n◦ *Username:* @${user.uniqueId}\n\nSistem berhasil memvalidasi Bio kamu.`
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '𝗠𝘆𝗜𝗻𝗳𝗼', id: '.myinfo' }) }]
                        })
                    })
                }
            }
        }, { quoted: m });

        await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        
    } catch (err) {
        console.error(err);
        bales(`⚠️ Gagal/username typo`);
    }
}
break;
case 'info': case 'myinfo': {
  try {
    const groupId = m.chat;
    // Cek data verif berdasarkan Group & Sender
    const tData = tiktokDB[groupId]?.[m.sender]; 
    const dbFile = './database/bio.json';
    let bioDB = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf-8')) : {};
    const groupBios = bioDB[groupId] ? Object.values(bioDB[groupId]) : [];
    if (!tData?.username)
      return bales(`⚠️ Kamu belum verif di grup ini!\nKetik: .verif <username>\nContoh: .verif zyncdev`);

    const username = tData.username;

    // API Hanggts → info utama
    const r1 = await axios.get(`https://api.hanggts.xyz/stalk/tiktok?user=${username}`);
    if (!r1.data?.status) return bales('❌ Data tidak ditemukan.');
    const u = r1.data.result;

    // API Deline → total video & region
    const r2 = await axios.get(`https://api.deline.web.id/stalker/ttstalk?username=${username}`);
    let videoCount = u.videoCount || 0;
    let region = '-';
    if (r2.data?.status) {
      videoCount = r2.data.result.stats.videoCount || videoCount;
      region = r2.data.result.user.region || '-';
    }
    const bioSekarang = u.signature || '-'
    if (groupBios.length > 0) {
        
        const masihSesuai = groupBios.some(v => bioSekarang.toLowerCase().includes(v.toLowerCase()));

        if (!masihSesuai) {
            // JIKA TIDAK SESUAI -> Hapus data verif!
            delete tiktokDB[groupId][m.sender];
            saveTiktokDB();
            return bales(`🚫 *VERIFIKASI DICABUT!*\n\nSistem mendeteksi Bio TikTok kamu sudah berubah dan tidak lagi sesuai aturan grup.\nSilahkan pasang kembali bio yang benar dan verif ulang.`);
        }
    }
    // FX ANGKA
    const fx = n => Intl.NumberFormat('id-ID', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(n) + ` (${n})`;

    // WAKTU RELATIF
    const rel = unix => {
      if (!unix) return '-';
      const diff = Date.now() - unix * 1000;
      const sec = Math.floor(diff / 1000);
      const min = Math.floor(sec / 60);
      const hour = Math.floor(min / 60);
      const day = Math.floor(hour / 24);
      const week = Math.floor(day / 7);
      const month = Math.floor(day / 30);
      const year = Math.floor(day / 365);
      if (year > 0) return `${year} tahun yang lalu`;
      if (month > 0) return `${month} bulan yang lalu`;
      if (week > 0) return `${week} minggu yang lalu`;
      if (day > 0) return `${day} hari yang lalu`;
      if (hour > 0) return `${hour} jam yang lalu`;
      if (min > 0) return `${min} menit yang lalu`;
      return `${sec} detik yang lalu`;
    };

    const created = rel(u.createTime);
    const lastNickChange = rel(u.nickNameModifyTime);

    // CAPTION
    const caption = `
୧✿ 𝗡𝗶𝗰𝗸𝗡𝗮𝗺𝗲: ${u.nickname || '-'}
୧✿ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${u.uniqueId || username}
୧✿ 𝗕𝗶𝗼: ${u.signature || '-'}

୧✿ 𝗣𝗲𝗻𝗴𝗶𝗸𝘂𝘁: ${fx(u.followerCount)}
୧✿ 𝗧𝗼𝘁𝗮𝗹 𝗦𝘂𝗸𝗮: ${fx(u.heart)}
୧✿ 𝗧𝗼𝘁𝗮𝗹 𝗩𝗶𝗱𝗲𝗼: ${fx(videoCount)} video
୧✿ 𝗠𝗲𝗻𝗴𝗶𝗸𝘂𝘁𝗶: ${fx(u.followingCount)}

୧✿ 𝗥𝗲𝗴𝗶𝗼𝗻: ${region}
୧✿ 𝗩𝗲𝗿𝗶𝗳𝗶𝗸𝗮𝘀𝗶: ${u.verified ? 'Ya' : 'Tidak'}
୧✿ 𝗔𝗸𝘂𝗻 𝗗𝗶𝗯𝘂𝗮𝘁: ${created}
୧✿ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 𝗧𝗲𝗿𝗮𝗸𝗵𝗶𝗿 𝗗𝗶𝘂𝗯𝗮𝗵: ${lastNickChange}
`.trim();

    // BUTTON CTA URL
    const buttons = [{
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: `Kunjungi ${u.nickname}`,
        url: `https://www.tiktok.com/@${u.uniqueId || username}`,
        merchant_url: `https://www.tiktok.com/@${u.uniqueId || username}`
      })
    }];

    // KIRIM PRODUCT MESSAGE TANPA HARGA
    await spark.sendMessage(
      m.chat,
      {
        product: {
          productImage: { url: u.avatarLarger || u.avatarMedium || u.avatarThumb },
          productId: "998877665544332211",
          title: ` 「𖥔𝐈𝐍𝐅𝐎 𝐓𝐈𝐊𝐓𝐎𝐊𖥔」\n`,
          description: '',
          currencyCode: " ",
          priceAmount1000: "0",
          retailerId: "",
          url: `https://www.tiktok.com/@${u.uniqueId || username}`,
          productImageCount: 1
        },
        businessOwnerJid: m.sender,
        caption: caption,
        interactiveButtons: buttons
      },
      { quoted: m }
    );

  } catch (err) {
    console.error('MYINFO ERROR:', err);
    bales(`⚠️ Error:\n${err.message}`);
  }
}
break;
case 'upsw':
case 'swgc': {
    if (!isAdmin) return bales('❌ Only Admin');
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        let type = q.mtype;

        // JIKA STIKER (Convert dulu baru Upload)
        if (/webp/.test(mime) || type === 'stickerMessage') {
            const media = await spark.downloadAndSaveMediaMessage(q);
            const out = `./sampah/${Date.now()}.png`;

            exec(`ffmpeg -i ${media} -vframes 1 ${out}`, async (err) => {
                if (fs.existsSync(media)) fs.unlinkSync(media);
                if (err) return bales("❌ Gagal konversi!");

                // UPLOAD BUFFER KE SERVER WA
                const mediaUpload = await prepareWAMessageMedia({ image: fs.readFileSync(out) }, { upload: spark.waUploadToServer });
                
                await spark.relayMessage(m.chat, {
                    groupStatusMessageV2: {
                        message: {
                            imageMessage: {
                                ...mediaUpload.imageMessage,
                                caption: text || ''
                            }
                        }
                    }
                }, {});

                if (fs.existsSync(out)) fs.unlinkSync(out);
                bales('✅ Status Group (Sticker) Updated!');
            });
        } 
        // JIKA MEDIA LAIN (Udah punya mediaKey/URL di server WA)
        else if (/image|video|audio/.test(mime) || type === 'viewOnceMessageV2') {
            let mediaContent = q.msg || q;
            let payload = {
                [type]: {
                    ...mediaContent,
                    caption: text || mediaContent.caption || ''
                }
            };
            await spark.relayMessage(m.chat, { groupStatusMessageV2: { message: payload } }, {});
            bales('✅ Status Group Updated!');
        } 
        // JIKA TEKS MURNI
        else {
            let teks = text || q.text || q.msg?.conversation || q.msg?.extendedTextMessage?.text;
            if (!teks) return bales(`❌ Mana teksnya?`);
            let payload = { extendedTextMessage: { text: teks } };
            await spark.relayMessage(m.chat, { groupStatusMessageV2: { message: payload } }, {});
            bales('✅ Status Group Updated!');
        }
    } catch (err) {
        console.error('[UPSW ERROR]', err);
        bales('⚠️ Gagal! Cek log.');
    }
}
break;

case 'hidetag':
case 'h': {
 if (!m.isGroup) return;
 if (!isOwner && !isAdmin) return bales("Only Admin");
  if (!db[m.chat]?.hidetag) return bales("Hidetag Belum di Aktifkan\nGunakan .on hidetag")
 let teks = q || (m.quoted ? m.quoted.text : null);

 if (!m.metadata || !m.metadata.participants)
 return bales("Gagal mendapatkan daftar anggota grup");

 // 🔥 CARA BOT LU NGAMBIL PARTICIPANT (DISAMAKAN)
 let jir = m.metadata.participants.map(v =>
 v.id.includes("@s.whatsapp.net") ? v.id : v.jid
 );

 if (m.quoted) {
 await spark.sendMessage(
 m.chat,
 {
 forward: m.quoted.fakeObj,
 mentions: jir
 },
 { quoted: qmeta }
 );
 } else {
 if (!teks) return bales('Kirim teks atau reply pesan.');

 await spark.sendMessage(
 m.chat,
 {
 text: teks,
 mentions: jir
 },
 { quoted: qmeta }
 );
 }
}
break;
case 'leaderboard':
case 'lb': {
    // Ambil input setelah command
    const args = m.text.trim().split(/ +/).slice(1)
    const type = args[0]?.toLowerCase()

    // 1. Menu Utama (Jika cuma ketik .lb)
    if (!type) {
        const selectionTeks = `*LEADERBOARD SELECTION*\n\nSilahkan pilih kategori leaderboard yang ingin di lihat.`
        
        const msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: selectionTeks }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '👥 Group Rank', id: '.lb group' })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '🌎 Global Rank', id: '.lb global' })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })

        return await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    // 2. Proses Data (Jika .lb group atau .lb global)
    try {
        const isGlobal = type === 'global'
        let leaderboard = []
        let teks = isGlobal ? `🌎 *TOP 5 GLOBAL RANK*\n\n` : `🏆 *LEADERBOARD GRUP*\n\n`

        if (isGlobal) {
            let allUsers = []
            Object.keys(rankDB).forEach(gid => {
                Object.entries(rankDB[gid]).forEach(([jid, data]) => {
                    if (jid.endsWith('@s.whatsapp.net')) {
                        let ex = allUsers.find(u => u.jid === jid)
                        if (ex) { 
                            ex.messages += (data.messages || 0) 
                        } else { 
                            allUsers.push({ jid, ...data, fromGroup: gid }) 
                        }
                    }
                })
            })
            leaderboard = allUsers.sort((a, b) => b.messages - a.messages).slice(0, 5)
        } else {
            const groupRank = rankDB[m.chat] || {}
            leaderboard = Object.entries(groupRank)
                .filter(([jid]) => jid.endsWith('@s.whatsapp.net'))
                .map(([jid, data]) => ({ jid, ...data }))
                .sort((a, b) => b.messages - a.messages).slice(0, 10)
        }

        if (leaderboard.length === 0) return m.reply('Data masih kosong, bre.')

        for (let i = 0; i < leaderboard.length; i++) {
            const data = leaderboard[i]
            teks += `#${i + 1} ${data.name || 'User'}\n`
            if (isGlobal) {
                const gMeta = await spark.groupMetadata(data.fromGroup).catch(() => ({ subject: 'Unknown Group' }))
                teks += `🏢 Grup: ${gMeta.subject}\n`
            }
            teks += `💬 Pesan: ${data.messages} | Rank: ${data.tier || 'Bronze'}\n\n`
        }

        m.reply(teks)

    } catch (e) {
        console.error(e)
        m.reply('Error pas narik data leaderboard.')
    }
}
break;
case 'infoupdate': {
 balas (`[ NEXT UPDATE FITUR ]
- absen
- deteksi upload 
- statsbot
- list online
- whatanime
- topaktif
- sewa bot
- anti tag sw
- anti deleted
- akses group (on off)
- warning
- top akun tiktok
- pinterest 
- pixiv
- hitamkan 
- Tentunya Fix Api dan fitur Error Jika ada 

INGIN JADI BAGIAN KAMI? CONTACT 
- 6283854859219 [ Fast ]
- t.me/kyleTzy13 [ OFF ]`)}
break;

case 'cn': {
 const groupId = m.chat
 const args = text ? text.split(" ") : []
 const sub = args[0]?.toLowerCase()

 // ===== INIT DATA =====
 if (!cnData[groupId]) cnData[groupId] = { list: [], posData: {}, font: "1" }
 else if (Array.isArray(cnData[groupId])) cnData[groupId] = { list: cnData[groupId], posData: {}, font: "1" }
 else {
 if (!Array.isArray(cnData[groupId].list)) cnData[groupId].list = []
 if (!cnData[groupId].posData) cnData[groupId].posData = {}
 if (!cnData[groupId].font) cnData[groupId].font = "1"
 }

 // ===== FONT MAP =====
 const font1 = { A:"𝘼",B:"𝘽",C:"𝘾",D:"𝘿",E:"𝙀",F:"𝙁",G:"𝙂",H:"𝙃",I:"𝙄",J:"𝙅",K:"𝙆",L:"𝙇",M:"𝙈",N:"𝙉",O:"𝙊",P:"𝙋",Q:"𝙌",R:"𝙍",S:"𝙎",T:"𝙏",U:"𝙐",V:"𝙑",W:"𝙒",X:"𝙓",Y:"𝙔",Z:"𝙕",
 a:"𝙖",b:"𝙗",c:"𝙘",d:"𝙙",e:"𝙚",f:"𝙛",g:"𝙜",h:"𝙝",i:"𝙞",j:"𝙟",k:"𝙠",l:"𝙡",m:"𝙢",n:"𝙣",o:"𝙤",p:"𝙥",q:"𝙦",r:"𝙧",s:"𝙨",t:"𝙩",u:"𝙪",v:"𝙫",w:"𝙬",x:"𝙭",y:"𝙮",z:"𝙯" }
 const font2 = { A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭",
 a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇" }
 const font3 = { A:"𝑨",B:"𝑩",C:"𝑪",D:"𝑫",E:"𝑬",F:"𝑭",G:"𝑮",H:"𝑯",I:"𝑰",J:"𝑱",K:"𝑲",L:"𝑳",M:"𝑴",N:"𝑵",O:"𝑶",P:"𝑷",Q:"𝑸",R:"𝑹",S:"𝑺",T:"𝑻",U:"𝑼",V:"𝑽",W:"𝑾",X:"𝑿",Y:"𝒀",Z:"𝒁",
 a:"𝒂",b:"𝒃",c:"𝒄",d:"𝒅",e:"𝒆",f:"𝒇",g:"𝒈",h:"𝒉",i:"𝒊",j:"𝒋",k:"𝒌",l:"𝒍",m:"𝒎",n:"𝒏",o:"𝒐",p:"𝒑",q:"𝒒",r:"𝒓",s:"𝒔",t:"𝒕",u:"𝒖",v:"𝒗",w:"𝒘",x:"𝒙",y:"𝒚",z:"𝒛" }
 const font4 = { A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
 a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳" }

 const fonts = { "1":font1, "2":font2, "3":font3, "4":font4 }

 // ===== .cn MENU =====
 if (!text) {
 if (cnData[groupId].list.length === 0)
 return bales(
`*「፨ CN MENU ፨」*

Belum ada CN.

• .cn set
• .cn add
• .cn del
• .cn list
• .cn post
• .cn clear
• .cn font <1-4>
• .cn <nama>`
 )

 return bales(
`*「፨ CN MENU ፨」*

${cnData[groupId].list.map((v,i)=>{
 const pos = cnData[groupId].posData[i] || "depan"
 return `${i+1}. ${v}\n Name: ${pos}`
}).join("\n\n")}

• .cn set
• .cn add
• .cn del
• .cn list
• .cn post
• .cn clear
• .cn font <1-4>
• .cn <nama>`
 )
 }

 // ===== .cn font =====
 if (sub === 'font') {
 if (!isAdmin && !isOwner) return bales("Hanya Admin")

 if (!args[1]) {
 return bales(
`*「፨ CN FONT LIST ፨」*

1️⃣ 𝘾𝙤𝙣𝙩𝙤𝙝 𝘾𝙉
2️⃣ 𝗖𝗼𝗻𝘁𝗼𝗵 𝗖𝗡
3️⃣ 𝑪𝒐𝒏𝒕𝒐𝒉 𝑪𝑵
4️⃣ 𝐂𝐨𝐧𝐭𝐨𝐡 𝐂𝐍

Gunakan:
• .cn font 1
• .cn font 2
• .cn font 3
• .cn font 4`
 )
 }

 if (!fonts[args[1]]) return bales("⚠️ Pilih font 1–4.")
 cnData[groupId].font = args[1]
 saveCN()
 return bales(`✅ Font CN diset ke Font ${args[1]}`)
 }
    
if (sub === 'post') {
  if (!isAdmin ) return bales(mess.admin)
  if (cnData[groupId].list.length === 0)
    return bales("Belum ada CN tersimpan.")
  // format: .cn post 1 depan
  // args setelah sub
const argsPost = args.slice(1) // hapus 'post'
if (!/^\d+\s+(depan|belakang)$/i.test(argsPost.join(" "))) {
  return bales("⚠️ Gunakan format: .cn post <nomor> <depan/belakang>")
}
const [nomor, posisi] = argsPost
  const idx = Number(nomor) - 1
  if (!cnData[groupId].list[idx]) return bales("⚠️ Nomor salah.")
  cnData[groupId].posData[idx] = posisi.toLowerCase()
  saveCN()
  return bales(`✅ Posisi CN #${nomor} diset ke: *${posisi.toUpperCase()}*`)
}
 // ===== SUB LAIN =====
 if (sub === 'set') {
 if (!isAdmin && !isOwner ) return bales(mess.admin)
 const isi = text.slice(4).trim()
 if (!isi) return bales('.cn set A|B|C')
 cnData[groupId].list.push(...isi.split('|').map(v=>v.trim()))
 saveCN()
 return bales('✅ Ditambahkan')
 }

 if (sub === 'add') {
 if (!isAdmin && !isOwner ) return bales(mess.admin)
 const isi = text.slice(4).trim()
 if (!isi) return bales('.cn add ABC')
 cnData[groupId].list.push(isi)
 saveCN()
 return bales('✅ Ditambahkan')
 }

 if (sub === 'del') {
 if (!isAdmin) return bales(mess.admin) 
 const idx = Number(args[1]) - 1
 if (!cnData[groupId].list[idx]) return bales('⚠️ Nomor salah')
 cnData[groupId].list.splice(idx,1)
 delete cnData[groupId].posData[idx]
 saveCN()
 return bales('✅ Dihapus')
 }

 if (sub === 'list') {
 if (cnData[groupId].list.length === 0) return bales('Kosong')
 return bales(
cnData[groupId].list.map((v,i)=>{
 const pos = cnData[groupId].posData[i] || "depan"
 return `${i+1}. ${v}\n Name: ${pos}`
}).join("\n\n")
 )
 }
// ===== .cn clear =====
if (sub === 'clear') {
    if (!isAdmin && !isOwner) return bales(mess.admin)
    
    // Reset data grup tersebut ke kondisi awal
    cnData[groupId] = { 
        list: [], 
        posData: {}, 
        font: "1" 
    }
    
    saveCN() // Simpan perubahan ke file json
    return bales("✅ *Data CN Group ini telah dibersihkan!*")
}
 // ===== GENERATE CN (INTERACTIVE) =====
 if (!["set","add","del","list","post","clear","font"].includes(sub)) {
 if (cnData[groupId].list.length === 0) return bales("Gak ada cn \n> Kayaknya Belum di set.")

 const fontPick = fonts[cnData[groupId].font] || font1
 const nama = text.split("").map(c=>fontPick[c]||c).join("")

 const hasil = cnData[groupId].list.map((t,i)=>{
 const pos = cnData[groupId].posData[i] || "depan"
 return pos === "depan" ? `${nama} ${t}` : `${t} ${nama}`
 })

 const buttons = hasil.map(v=>({
 name: "cta_copy",
 buttonParamsJson: JSON.stringify({
 display_text: v,
 copy_code: v
 })
 }))

 const msg = await generateWAMessageFromContent(groupId, {
 viewOnceMessage: {
 message: {
 interactiveMessage: proto.Message.InteractiveMessage.create({
 body: proto.Message.InteractiveMessage.Body.create({
 text: `✨ *Generated CN (${hasil.length})*`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons
 })
 })
 }
 }
 }, { quoted: m })

 await spark.relayMessage(groupId, msg.message, { messageId: msg.key.id })
 }
}
break;
case 'bio': {
    const groupId = m.chat;
    const dbFile = './database/bio.json';

    // Pastikan folder & file database aman
    if (!fs.existsSync('./database')) fs.mkdirSync('./database');
    if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({}), 'utf-8');

    // Baca DB dengan UTF-8 biar font unik gak pecah
    let bioDB = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    if (!bioDB[groupId]) bioDB[groupId] = {};

    const saveBio = () => fs.writeFileSync(dbFile, JSON.stringify(bioDB, null, 2), 'utf-8');
    const args1 = args[0]?.toLowerCase();

    // 1. TAMPILKAN BIO (MODAL CTA COPY)
    if (!args1) {
        const keys = Object.keys(bioDB[groupId]);
        if (keys.length === 0) return bales("❌ Bio di grup ini belum diset.");

        const buttons = keys.map(k => ({
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: bioDB[groupId][k],
                copy_code: bioDB[groupId][k]
            })
        }));

        const msg = generateWAMessageFromContent(groupId, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `✨ *Bio TikTok Copy*\nKlik teks untuk menyalin.` }),
                        footer: { text: 'Bio Manager' },
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
                    })
                }
            }
        }, { quoted: m });

        return await spark.relayMessage(groupId, msg.message, { messageId: msg.key.id });
    }

    // 2. SET BIO (Pemisah +)
    if (args1 === "set") {
        if (!isAdmin) return bales(mess.admin);
        const isi = m.text.replace(/^\.bio\s+set\s+/i, '').trim();
        if (!isi || isi.toLowerCase().startsWith('.bio')) return bales("Format: .bio set teks1 + teks2");
        
        const items = isi.split("+").map(v => v.trim()).filter(v => v !== "");
        bioDB[groupId] = {};
        items.forEach((b, i) => bioDB[groupId][i] = b);
        saveBio();
        return bales(`✅ Berhasil menyimpan ${items.length} bio.`);
    }

    // 3. LIST BIO
    if (args1 === "list") {
        const keys = Object.keys(bioDB[groupId]);
        if (keys.length === 0) return bales("❌ Bio kosong.");
        let teks = `📋 *Daftar Bio Group*\n\n`;
        keys.forEach((k, i) => teks += `${i + 1}. ${bioDB[groupId][k]}\n`);
        return bales(teks);
    }

    // 4. DELETE BIO (Re-index)
    if (args1 === "del") {
        if (!isAdmin) return bales(mess.admin);
        const nomor = parseInt(args[1]);
        const keys = Object.keys(bioDB[groupId]);
        if (isNaN(nomor) || nomor < 1 || nomor > keys.length) return bales("❌ Nomor salah. Cek .bio list");
        
        delete bioDB[groupId][keys[nomor - 1]];
        const values = Object.values(bioDB[groupId]);
        bioDB[groupId] = {};
        values.forEach((v, i) => bioDB[groupId][i] = v);
        saveBio();
        return bales(`🗑️ Bio nomor ${nomor} dihapus.`);
    }

    // 5. CLEAR BIO
    if (args1 === "clear") {
        if (!isAdmin) return bales(mess.admin);
        bioDB[groupId] = {};
        saveBio();
        return bales("🗑️ Semua bio grup ini dihapus.");
    }

    // 6. TUTORIAL (Jika args[0] ngaco)
    return bales(
        `💡 *Tutorial Bio:*\n` +
        `• *.bio* (Salin bio)\n` +
        `• *.bio set* <teks1 + teks2>\n` +
        `• *.bio list* (Liat nomor)\n` +
        `• *.bio del* <nomor>\n` +
        `• *.bio clear* (Hapus semua)`
    );
}
break;
case 'on':
case 'off':
case 'set': {
 if (!m.isGroup) return bales("❌ Fitur ini khusus grup!")
 if (!isAdmin && !isOwner) return bales("❌ Khusus admin/owner!")

 const action = command // on | off | set
 const feature = args[0]?.toLowerCase()
 const value = args.slice(1).join(" ")

 // ===== FITUR YANG DITERIMA =====
 const allowedFeatures = ["akses", "welcome", "goodbye", "hidetag", "tiktokdetector", "antitagsw", "onlyadmin", "rank"]
 if (!feature || !allowedFeatures.includes(feature)) {
 return bales(`❌ Fitur tidak valid!
Fitur yang tersedia: ${allowedFeatures}

Format:
.on <fitur>
.off <fitur>
.set <fitur> <teks>

Contoh:
.on welcome
.off hidetag
.set welcome Halo @user`)
 }

 // ===== LOAD DB =====
 const groupDB = JSON.parse(fs.readFileSync("./database/GroupSettings.json"))
 const setDB = JSON.parse(fs.readFileSync("./database/set-database.json"))

 groupDB[m.chat] ??= {}
 setDB.group ??= {}
 setDB.group[m.chat] ??= {}

 // ===== ON / OFF =====
 if (action === "on" || action === "off") {
 const status = action === "on"

 // welcome / goodbye
 if (["welcome", "goodbye"].includes(feature)) {
 setDB.group[m.chat][feature] ??= { enabled: false, text: "" }
 setDB.group[m.chat][feature].enabled = status
 fs.writeFileSync("./database/set-database.json", JSON.stringify(setDB, null, 2))
 return bales(`✅ ${feature} berhasil di${status ? "aktifkan" : "nonaktifkan"}!`)
 }

 // akses / hidetag / tiktokdetector
 groupDB[m.chat][feature] = status
 fs.writeFileSync("./database/GroupSettings.json", JSON.stringify(groupDB, null, 2))
 return bales(`✅ ${feature} berhasil di${status ? "aktifkan" : "nonaktifkan"}!`)
 }

 // ===== SET =====
 if (action === "set") {
 if (!["welcome", "goodbye"].includes(feature))
 return bales("❌ Fitur ini tidak memiliki teks!")

 if (!value)
 return bales(`Format:
.set ${feature} <teks>
Tag: @user @group @count`)

 setDB.group[m.chat][feature] ??= { enabled: false, text: "" }
 setDB.group[m.chat][feature].text = value
 fs.writeFileSync("./database/set-database.json", JSON.stringify(setDB, null, 2))
 return bales(`✅ Teks ${feature} berhasil disimpan.`)
 }
}
break;

case 'enable':
case 'disable': { 
 if (!m.isGroup) return bales("❌ Fitur ini khusus grup!")

 const groupDB = JSON.parse(fs.readFileSync("./database/GroupSettings.json"))
 const setDB = JSON.parse(fs.readFileSync("./database/set-database.json"))

 groupDB[m.chat] ??= {}
 setDB.group ??= {}
 setDB.group[m.chat] ??= {}

 const features = ["akses", "hidetag", "tiktokdetector", "welcome", "goodbye", "antitagsw", "antitoxic", "antispam"]
 let text = command === "enable" 
 ? "✅ Fitur Aktif:\n\n" 
 : "❌ Fitur Nonaktif:\n\n"

 for (let f of features) {
 let status
 if (["welcome", "goodbye"].includes(f)) {
 status = (setDB.group[m.chat][f]?.enabled) || false
 } else {
 status = groupDB[m.chat][f] || false
 }

 if ((command === "enable" && status) || (command === "disable" && !status)) {
 text += `• ${f}`
 if (["welcome", "goodbye"].includes(f) && setDB.group[m.chat][f]?.text) {
 text += ` - Teks: ${setDB.group[m.chat][f].text}`
 }
 text += "\n"
 }
 }

 if (text.trim() === "✅ Fitur Aktif:" || text.trim() === "❌ Fitur Nonaktif:") 
 text += "Tidak ada fitur."

 return bales(text.trim())
}
break;
case 'hd': {
    const tipe = args[0]?.toLowerCase();
    const isHd1 = tipe === "low";
    const isHd2 = tipe === "high";
    const isHd3 = tipe === "pro"; 
    const urlFromButton = args[1];

    if (!m.quoted && !urlFromButton) return bales("Reply foto dengan perintah: .hd");

    try {
        if (!isHd1 && !isHd2 && !isHd3) {
            await spark.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            
            const mediaPath = await spark.downloadAndSaveMediaMessage(m.quoted);
            const sizeOriginal = (fs.statSync(mediaPath).size / 1024).toFixed(2); // Simpan size awal

            const form = new FormData();
            form.append('fileToUpload', fs.createReadStream(mediaPath));
            form.append('reqtype', 'fileupload');
            const upload = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
            const imgUrl = upload.data.trim();
            
            // Ambil resolusi awal
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${mediaPath}`, (err, res) => {
                const resOriginal = res.trim();
                fs.unlinkSync(mediaPath);

                const button = [{
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "Pilih Kualitas HD",
                        sections: [{
                            title: "Upscaler Type",
                            rows: [
                                // Kita titip data size & res di ID button juga
                                { title: "HD 1", description: "Ryuu Api (Cepat)", id: `.hd low ${imgUrl} ${resOriginal}|${sizeOriginal}` },
                                { title: "HD 2", description: "ZNX Api (Detail)", id: `.hd high ${imgUrl} ${resOriginal}|${sizeOriginal}` },
                                { title: "HD 3", description: "FFmpeg Pro (Local)", id: `.hd pro ${imgUrl} ${resOriginal}|${sizeOriginal}` }
                            ]
                        }]
                    })
                }];

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: { interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ text: "Silahkan pilih tipe upscaler." }),
                            footer: { text: "Premium Engine v2.6" },
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: button })
                        })}
                    }
                }, { quoted: m });

                spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            });
            return;
        }

        const dataInfo = args[2] ? args[2].split('|') : ["?", "?"];
        const resBefore = dataInfo[0];
        const sizeBefore = dataInfo[1];

        await spark.sendMessage(m.chat, { react: { text: "🪄", key: m.key } });

        if (isHd3) {
            const tempIn = `./sampah/raw_${Date.now()}.jpg`;
            const tempOut = `./sampah/pro_${Date.now()}.jpg`;
            const response = await axios.get(urlFromButton, { responseType: 'arraybuffer' });
            fs.writeFileSync(tempIn, response.data);

            const filter = "scale=iw*2:-1:flags=lanczos,unsharp=5:5:1.2:5:5:0.5,hqdn3d=1.5:1.5:6:6,eq=saturation=1.5:contrast=1.1";
            exec(`ffmpeg -i ${tempIn} -vf "${filter}" ${tempOut} -y`, async (err) => {
                if (err) return bales("Gagal processing FFmpeg Lokal.");
                const sizeAfter = (fs.statSync(tempOut).size / 1024).toFixed(2);
                exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${tempOut}`, async (err, resAfter) => {
                    await spark.sendMessage(m.chat, { 
                        image: fs.readFileSync(tempOut), 
                        caption: `✅ *HD FFMPEG PRO SUCCESS*\n\n📐 *Res:* ${resBefore} ➔ ${resAfter.trim()}\n📊 *Size:* ${sizeBefore}KB ➔ ${sizeAfter}KB\n🎨 *Style:* Local Gacor`
                    }, { quoted: m });
                    fs.unlinkSync(tempIn); fs.unlinkSync(tempOut);
                });
            });
            return;
        }

        // Logic API (HD 1 & HD 2) dengan detail probe
        let resultUrl = "";
        let provider = "";
        if (isHd1) {
            const { data } = await axios.get(`https://api.ryuu-dev.offc.my.id/imagecreator/upscaler4k?url=${encodeURIComponent(urlFromButton)}`);
            resultUrl = data.result;
            provider = "Ryuu AI";
        } else if (isHd2) {
            const { data } = await axios.get(`https://api.zenitsu.web.id/api/tools/hd?imgUrl=${encodeURIComponent(urlFromButton)}`);
            resultUrl = data.results;
            provider = "ZNX AI";
        }

        if (!resultUrl) return bales("Gagal API.");

        // Pakai probe-image-size buat dapetin detail hasil API tanpa download manual dulu
        const probe = require('probe-image-size');
        const infoAfter = await probe(resultUrl);

        await spark.sendMessage(m.chat, { 
            image: { url: resultUrl }, 
            caption: `✅ *HD PHOTO SUCCESS*\n\n📐 *Res:* ${resBefore} ➔ ${infoAfter.width}x${infoAfter.height}\n📊 *Size:* ${sizeBefore}KB ➔ ${(infoAfter.length / 1024).toFixed(2)}KB\n⚙️ *Engine:* ${provider} (Cloud)`
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        bales("⚠️ Error memproses.");
    }
}
break;

case 'ppcouple': {
    try {
        const res = await axios.get('https://api.deline.web.id/random/ppcouple', { timeout: 8000 });
        if (!res.data?.status) return bales('❌ Gagal mengambil data PP Couple');

        const { cowo, cewe } = res.data.result;

        // kirim cowo
        await spark.sendMessage(m.chat, {
            image: { url: cowo },
            caption: '🧑 PP Cowok',
        }, { quoted: m });

        // kirim cewe
        await spark.sendMessage(m.chat, {
            image: { url: cewe },
            caption: '👩 PP Cewek',
        }, { quoted: m });

    } catch (err) {
        console.log(chalk.red('[❌ Error PPCouple]'), err);
        return bales(`⚠️ Error PPCouple: ${err.message}`);
    }
}
break;

case 'addcase': {
  if (!isOwner) return bales ("only Zync") 
  if (!text.includes("case '")) return bales('case nya');
  const fs = require('fs');
  const namaFile = 'zync.js';
  const caseBaru = `${text.trim()}`;
  try {
    const data = fs.readFileSync(namaFile, 'utf8');
    const posisiTarget = data.indexOf("case 'addcase':");
    if (posisiTarget !== -1) {
      const kodeBaruLengkap = data.slice(0, posisiTarget) + '\n' + caseBaru + '\n' + data.slice(posisiTarget);
      fs.writeFileSync(namaFile, kodeBaruLengkap, 'utf8');
      bales(`[ ✓ ] Berhasil menyisipkan case baru!\nSilakan restart bot agar case aktif.`);
    } else {
      bales('[ x ] Tidak ditemukan posisi target untuk menyisipkan case!');
    }
  } catch (err) {
    console.error(err);
    bales('[ x ] Terjadi error saat membaca/menulis file!');
  }
}
break;
case 'hastag': {
 const detekData = loadDetek();
 if (!detekData[m.chat]) detekData[m.chat] = { tiktokHashtags: [], cnFonts: [] };
 const group = detekData[m.chat];
 const args = text ? text.split(" ") : [];
 const cmd = args[0] ? args[0].toLowerCase() : '';

 if (!text) {
 return bales(`*「፨HASTAG MENU፨」*
- hastag add tag > menambah 1 hashtag
- hastag set tag1|tag2 > menambah banyak hashtag sekaligus
- hastag del <nomor> > hapus hashtag
- hastag list > lihat daftar hashtag
- hastag clear > hapus semua hashtag
- hastag cek > cek statistik semua hashtag

[ FITUR HASTAG CEK MENGALAMI GANGGUAN BLOCK LIMIT ]`);

 }
 async function checkHashtag(tag) {
 const cleanTag = tag.replace(/^#/, '');
 try {
 const res = await axios.get(`https://www.tiktok.com/api/challenge/detail/?challengeName=${encodeURIComponent(cleanTag)}`);
 if (!res.data.challengeInfo || !res.data.challengeInfo.statsV2) return false;
 return true;
 } catch {
 return false;
 }
 }

 if (cmd === 'add') {
 if (!isAdmin && !isOwner) return bales(mess.admin);
 let tag = args[1];
 if (!tag) return bales('❌ Masukkan hashtag');
 tag = tag.startsWith('#') ? tag : `#${tag}`;
 const valid = await checkHashtag(tag);
 
 if (!group.tiktokHashtags.includes(tag)) group.tiktokHashtags.push(tag);
 saveDetek(detekData);
 return bales(`✅ Ditambahkan: ${tag}`);
 }

 if (cmd === 'set') {
 if (!isAdmin && !isOwner) return bales(mess.admin);
 const tags = args.slice(1).join(" ").split("|").map(t => t.trim()).filter(Boolean);
 if (!tags.length) return bales('❌ Masukkan minimal 1 hashtag');

 const finalTags = [];
 for (let t of tags) {
 t = t.startsWith('#') ? t : `#${t}`;
 const valid = await checkHashtag(t);
 
 finalTags.push(t);
 }

 group.tiktokHashtags = [...new Set([...group.tiktokHashtags, ...finalTags])];
 saveDetek(detekData);
 return bales(`✅ Ditambahkan: ${finalTags.join(', ')}`);
 }

 if (cmd === 'del') {
 if (!isAdmin && !isOwner) return bales(mess.admin);
 if (!group.tiktokHashtags.length) return bales(' Belum ada hashtag tersimpan.');

 if (!args[1]) {
 const list = group.tiktokHashtags.map((t, i) => `${i + 1}. ${t}`).join('\n');
 return bales(`🗑️ Daftar Hashtag:\n${list}\n\nContoh: *hastag del 1*`);
 }

 const index = parseInt(args[1]) - 1;
 if (isNaN(index) || index < 0 || index >= group.tiktokHashtags.length)
 return bales('⚠️ Nomor tidak valid.');

 group.tiktokHashtags.splice(index, 1);
 saveDetek(detekData);
 return bales('✅ Hashtag berhasil dihapus.');
 }

 if (cmd === 'list') {
 if (!group.tiktokHashtags.length) return bales('Belum ada hashtag tersimpan.');
 const list = group.tiktokHashtags.map((t, i) => `${i + 1}. ${t}`).join('\n');
 return bales(` Daftar Hashtag:\n${list}`);
 }

 if (cmd === 'clear') {
 if (!isAdmin && !isOwner) return bales(mess.admin);
 if (!group.tiktokHashtags.length) return bales(' Belum ada hashtag tersimpan.');
 group.tiktokHashtags = [];
 saveDetek(detekData);
 return bales('✅ Semua hashtag dihapus.');
 }

 if (cmd === 'cek') {
 const hashtags = group.tiktokHashtags;
 if (!hashtags.length) return bales('📭 Tidak ada hashtag tersimpan.');

 const headers = {
 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
 };

 function formatCount(n) {
 if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt';
 if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'rb';
 return n.toString();
 }

 let teks = '';
 const buttons = [];

 for (const tag of hashtags) {
 const cleanTag = tag.replace(/^#/, '');
 let videoCount = 0, viewCount = 0;

 try {
 const url = `https://www.tiktok.com/api/challenge/detail/?challengeName=${encodeURIComponent(cleanTag)}`;
 const res = await axios.get(url, { headers });
 const info = res.data.challengeInfo;

 if (info?.statsV2) {
 videoCount = info.statsV2.videoCount ?? 0;
 viewCount = info.statsV2.viewCount ?? 0;
 teks += `*${tag}*\n- *Video:* ${formatCount(videoCount)}\n└ *Views :* ${formatCount(viewCount)}\n\n`;
 } else {
 teks += `#️⃣ ${tag} ❌ Tidak ada data\n`;
 }
 } catch (e) {
 console.error(`Error cek hashtag ${tag}:`, e.message);
 teks += `#️⃣ ${tag} ❌ Gagal mengambil data\n`;
 }

 buttons.push({
 name: "cta_url",
 buttonParamsJson: JSON.stringify({
 display_text: `Lihat #${cleanTag}`,
 url: `https://www.tiktok.com/tag/${cleanTag}`,
 merchant_url: `https://www.tiktok.com/tag/${cleanTag}`
 })
 });
 }

 await spark.sendMessage(
 m.chat,
 {
 product: {
 productImage: { url: ppUrl },
 productId: "223344556677889900",
 title: ` *「፨ HASHTAG INFO ፨」*`,
 description: '',
 currencyCode: '',
 priceAmount1000: '0',
 retailerId: '',
 url: "https://www.tiktok.com",
 productImageCount: 1
 },
 businessOwnerJid: m.sender,
 caption: teks,
 title: "",
 subtitle: "",
 footer: "",
 hasMediaAttachment: true,
 interactiveButtons: buttons
 },
 { quoted: m }
 );
 return;
 }

 bales('❌ Sub-command tidak dikenal.');
}
break;
case 'mute': {
 const groupId = m.chat;
 if (!muteDB[groupId]) muteDB[groupId] = {};

 const args1 = args[0]?.toLowerCase();
    let user;
 if (m.mentionedJid?.[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
    user = m.quoted.sender;
    } else if (text) {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned) user = cleaned + "@s.whatsapp.net";
        }
 // ===== LIST MUTE =====
 if (args1 === 'list') {
 const list = Object.keys(muteDB[groupId]);
 if (!list.length) return bales("Tidak ada user yang dimute.");
 let teks = "Daftar user yang dimute:\n";
 for (let u of list) {
 teks += `• @${u.split("@")[0]}\n`;
 }
 return bales(teks, { mentions: list });
 }

 // ===== UNMUTE =====
 if (args1 === 'un') {
 if (!isAdmin) return bales(mess.admin);
 if (!user) return bales("📌 Tag atau reply user untuk unmute.");
 delete muteDB[groupId][user];
 saveMuteDB();
 return bales(`✅ @${user.split("@")[0]} sudah diunmute.`, { mentions: [user] });
 }

 // ===== SET MUTE =====
 if (!user) return bales("📌 Tag atau reply user untuk mute.");
 if (!isAdmin && !isOwner) return bales(mess.admin) 
const tamvan = global.owner+"@s.whatsapp.net"
const isTamvan = tamvan.includes(user)
 if (isTamvan) return bales("❌ Tidak bisa mute My Owner.");

 muteDB[groupId][user] = true; // true = mute permanen
 saveMuteDB();
 return bales(`shuttt @${user.split("@")[0]} Kamu Udah dimute.`, { mentions: [user] });
}
break;
case 'swgrup': {
 if (!text && !m.quoted)
 return bales(
 `reply media atau tambahkan teks.\nexample: ${prefix + command} (reply image/video/audio) hai ini saya`
 );

 const quoted = m.quoted ? m.quoted : m;
 const mime = (quoted.msg || quoted).mimetype || "";
 const caption = m.body.replace(/^\.swgrup\s*/i, "").trim();
 const jid = m.chat;

 if (/image/.test(mime)) {
 const buffer = await quoted.download();
 await spark.sendMessage(jid, {
 groupStatusMessage: {
 image: buffer,
 caption
 }
 });
 await bales("✅");

 } else if (/video/.test(mime)) {
 const buffer = await quoted.download();
 await spark.sendMessage(jid, {
 groupStatusMessage: {
 video: buffer,
 caption
 }
 });
 await bales("✅");

 } else if (/audio/.test(mime)) {
 const buffer = await quoted.download();
 await spark.sendMessage(jid, {
 groupStatusMessage: {
 audio: buffer
 }
 });
 await bales("✅");

 } else if (caption) {
 await spark.sendMessage(jid, {
 groupStatusMessage: {
 text: caption
 }
 });
 await bales("✅");
 }
}
break;
case 'cekq': {
 try {
 if (!isOwner) return bales(mess.owner) 
 if (!m.quoted) return bales('❌ Reply pesan dulu untuk dicek');

 // Simpan semua info quoted
 const quotedInfo = {
 mtype: m.quoted.mtype,
 text: m.quoted.text || m.quoted.msg?.conversation || m.quoted.msg?.extendedTextMessage?.text || null,
 caption: m.quoted.msg?.imageMessage?.caption || m.quoted.msg?.videoMessage?.caption || null,
 mimetype: m.quoted.msg?.mimetype || null,
 sender: m.quoted.sender || m.quoted.key?.participant || null,
 id: m.quoted.id || m.quoted.key?.id || null,
 key: m.quoted.key || null,
 raw: m.quoted // buat lihat seluruh struktur
 };

 await bales(
 `*「 QUOTED INFO 」*\n\n` +
 `• Type: ${quotedInfo.mtype}\n` +
 `• Text: ${quotedInfo.text || '-'}\n` +
 `• Caption: ${quotedInfo.caption || '-'}\n` +
 `• Mime: ${quotedInfo.mimetype || '-'}\n` +
 `• Sender: ${quotedInfo.sender || '-'}\n` +
 `• ID: ${quotedInfo.id || '-'}\n\n` +
 `• RAW JSON: \n${JSON.stringify(quotedInfo.raw, null, 2)}`
 );
 console.log(`${JSON.stringify(quotedInfo.raw, null, 2)}`)
 } catch (err) {
 bales(`❌ ERROR CEK QUOTED:\n${err.message}`);
 }
}
break;
case 'getcase': {
 if (!isOwner) return bales (mess.owner) 
 if (!text) return bales('nama case');
 
 const namaFile = 'zync.js';
 const namaCase = text.trim();

 try {
 const isiFile = fs.readFileSync(namaFile, 'utf8');
 const regex = new RegExp(`(case ['"]${namaCase}['"]:[\\s\\S]*?break;)`, 'g');
 const cocok = isiFile.match(regex);

 if (!cocok) return bales(`[ x ] Case '${namaCase}' tidak ditemukan!`);

 const isiCase = cocok[0];

 const msg = generateWAMessageFromContent(m.chat, {
 viewOnceMessage: {
 message: {
 messageContextInfo: {
 deviceListMetadata: {},
 deviceListMetadataVersion: 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 body: proto.Message.InteractiveMessage.Body.create({
 text: isiCase
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [
 {
 name: 'cta_copy',
 buttonParamsJson: JSON.stringify({
 display_text: 'Salin Case',
 copy_code: isiCase
 })
 }
 ]
 })
 })
 }
 }
 }, { userJid: m.sender, quoted: m });

 await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

 } catch (err) {
 console.error(err);
 bales('[ x ] Gagal membaca isi case!');
 }
}
break;

case 'delcase': {
 if (!isOwner) return bales ("Gktw") 
 if (!text) return bales('nama case');

 const fs = require('fs');
 const namaFile = 'zync.js';
 const namaCase = text.trim();

 try {
 let isiFile = fs.readFileSync(namaFile, 'utf8');

 const regex = new RegExp(`case ['"]${namaCase}['"]:[\\s\\S]*?break;`, 'g');
 if (!regex.test(isiFile)) return bales(` Case '${namaCase}' tidak ditemukan!`);

 const isiBaru = isiFile.replace(regex, '');
 fs.writeFileSync(namaFile, isiBaru, 'utf8');

 bales(`Case '${namaCase}' berhasil dihapus!.`);
 } catch (err) {
 console.error(err);
 bales('[ x ] Gagal menghapus case! Cek kembali struktur file.');
 }
}
break;

case 'afk': {
 try {
 let reason = text || 'Cium zync Dulu';
 let timeNow = Date.now();
 // Simpan status AFK langsung
 let obj = {
 id: m.sender,
 time: Date.now(),
 reason
 }
 _afk.push(obj)
 fs.writeFileSync('./database/afk.json', JSON.stringify(_afk))
 const senderTag = m.sender;
 const mentionText = `@${m.sender.split('@')[0]}`;
 const buttons = [
 {
 name: 'cta_url',
 buttonParamsJson: JSON.stringify({
 display_text: 'Chat Admin',
 url: `https://wa.me/6283854859219`
 })
 }
 ];   
 const msg = await generateWAMessageFromContent(m.chat, {
 viewOnceMessage: {
 message: {
 messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, mentionedJid: [senderTag] },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: { mentionedJid: [senderTag] },
 body: proto.Message.InteractiveMessage.Body.create({
 text: `- ✨ ${mentionText} Memulai Afk\n╰╸ Reason: ${reason}`
 }),
 footer: proto.Message.InteractiveMessage.Footer.create({
 text: ''
 }),
 header: { hasMediaAttachment: false },
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
buttons
 })
 })
 }
 }
 }, { quoted: FakeSticker });  
 await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
 } catch (err) {
 console.error('AFK CASE ERROR:', err);
 bales(`⚠️ Error:\n${err.message}`);
 }
}
break;    
case 'rank': {
  try {
    const groupId = m.chat
    const userId = m.sender
    const pushName = m.pushName || userId.split("@")[0]
    const meta = await spark.groupMetadata(groupId).catch(() => null)
    if (!meta) return bales('⚠️ Gagal ambil metadata grup')
    
    const totalMember = meta.participants.length
    let userData, posisiGrup, posisiGlobal, totalUserGlobal = 0

    // 1. Hitung Posisi GLOBAL & Total User Database
    let allUsers = []
    Object.keys(rankDB).forEach(gid => {
        Object.entries(rankDB[gid]).forEach(([jid, data]) => {
            if (jid.endsWith('@s.whatsapp.net')) {
                let ex = allUsers.find(u => u.jid === jid)
                if (ex) { ex.messages += (data.messages || 0) }
                else { allUsers.push({ jid, messages: data.messages || 0 }) }
            }
        })
    })
    const globalLeaderboard = allUsers.sort((a, b) => b.messages - a.messages)
    posisiGlobal = globalLeaderboard.findIndex(u => u.jid === userId) + 1 || 'N/A'
    totalUserGlobal = globalLeaderboard.length

    // 2. Logic Rank User (Owner/Member)
    if (isOwner) {
      userData = { messages: '∞', tier: 'Boundless', sub: '😈', name: 'Developer👑' }
      posisiGrup = '∞'
      posisiGlobal = '∞'
    } else {
      const data = rankDB[groupId]?.[userId] || { messages: 0, tier: 'Warrior', sub: 'III', name: pushName }
      userData = {
        messages: data.messages,
        tier: data.tier,
        sub: data.sub,          
        name: data.name
      }
      
      const groupLeaderboard = Object.entries(rankDB[groupId] || {})
        .sort((a, b) => b[1].messages - a[1].messages)
      posisiGrup = groupLeaderboard.findIndex(([jid]) => jid === userId) + 1 || 'N/A'
    }

    const rankDisplay = userData.sub ? `${userData.tier} ${userData.sub}` : userData.tier
    const teks = `
- 💬 𝐓𝐨𝐭𝐚𝐥 𝐂𝐡𝐚𝐭: ${userData.messages}
- 📊 𝐑𝐚𝐧𝐤: ${rankDisplay}

🏆 𝐆𝐫𝐨𝐮𝐩 𝐋𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝
└╸𝐊𝐞 ${posisiGrup} 𝐃𝐚𝐫𝐢 𝐓𝐨𝐭𝐚𝐥 ${totalMember} 𝐌𝐞𝐦𝐛𝐞𝐫

🌎 𝐆𝐥𝐨𝐛𝐚𝐥 𝐋𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝
└╸𝐊𝐞 ${posisiGlobal} 𝐃𝐚𝐫𝐢 𝐓𝐨𝐭𝐚𝐥 ${totalUserGlobal} 𝐔𝐬𝐞𝐫`     

    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🔎 MyInfo', id: '.myinfo' })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🌐 Leaderboard', id: '.lb' })
                  }
                ]
              })
            })
          }
        }
      },
      { quoted: m }
    )
    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.log('[ ERROR RANK ]', e)
    bales('⚠️ Terjadi kesalahan saat ambil data rank')
  }
}
break;
case "menu": {
let status = "User";
if (isOwner) status = "Owner";
let db = JSON.parse(fs.readFileSync('./database/feedback.json'))
let all = Object.values(db.rates)
let avg = all.length ? (all.reduce((a, b) => a + b.s, 0) / all.length).toFixed(1) : "0.0"
// Teks: ⭐ Rating: ${avg}/10 (⭐ Rating: ${avg})
const teks = `
Haii @${m.sender.split("@")[0]} 👋
Selamat ${ucapan()}
Kenalin Aku *${namaBot}*

*[ BOT INFORMATION ]*
- Botmode: ${spark.public ? "Public" : "Self"}
- Runtime: ${runtime(process.uptime())}
- Developer: @${global.owner}
- Status: ${status}
- Total Fitur : 41

⭐ Rating: ${avg}
- Dari ${all.length} User

💬 Mess:
- Jangan Berpikir Kamu sendiri karena.... ada aku disini

Silahkan pilih menu di bawah ini!
*Tekan Info Update Untuk Mengetahui Update Selanjutnya!!!*
`;

let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true, 
                    ...(await prepareWAMessageMedia({ image: { url: global.thumb } }, { upload: spark.waUploadToServer })),
                }, 
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "List Menu",
                                sections: [
                                    {
                                        title: "Pilih Menu",
                                        rows: [
                                            {
                                                title: "All Menu",
                                                description: "Menampilkan Semua Menu Bot",
                                                id: ".allmenu"
                                            },
                                            {
                                                title: "Sticker Menu",
                                                description: "Menu untuk membuat sticker",
                                                id: ".stickermenu"
                                            },
                                            {
                                                title: "Download Menu",
                                                description: "Menu untuk download media",
                                                id: ".downloadmenu"
                                            },
         {
                                                title: "Group Menu",
                                               description: "Menu untuk manage grup",
                                                id: ".grupmenu"
                                            },
                          {
                                                title: "Tools Image Menu",
                                                description: "Tools edit/convert gambar",
                                                id: ".toolsimagemenu"
                                            },
                                            
                                            {
                                                title: "Owner Menu",
                                                description: "Menu khusus ZyncSenpai",
                                                id: ".ownermenu"
                                            }
                                        ]
                                    }
                                ]
                            })
                        },
                         { name: "cta_url", buttonParamsJson: `{"display_text":"Sewa/Buy","url":"${global.linkown}","merchant_url":"${global.linkown}"}` }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender, global.owner + "@s.whatsapp.net"]
                }
            }
        }
    }
}, { userJid: m.sender, quoted: FakeSticker });

await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break
case "toolsimagemenu": {
  const hour = new Date().getHours()
  let ucapan
  if (hour < 10) ucapan = "pagi 🌅"
  else if (hour < 15) ucapan = "siang ☀️"
  else if (hour < 18) ucapan = "sore 🌇"
  else ucapan = "malam 🌙"

  const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

*｢ TOOLS & IMAGE ｣*
┠─⊷ .smeme <text>
┠─⊷ .upscale <2/4>
┠─⊷ .removebg
┠─⊷ .hd 
┠─⊷ .toimg
┠─⊷ .tomp3
┠─⊷ .pinterest

*Note:*
- Bila Ada Fitur Error Segera Laporkan Owner
- Tidak Tau Nomor Owner? Gunakan .owner`

  let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            ...(await prepareWAMessageMedia(
              { image: { url: getThumbnail() } },
              { upload: spark.waUploadToServer }
            ))
          },
          body: { text: teks },
          nativeFlowMessage: {
            buttons: [
              { name: "quick_reply", buttonParamsJson: `{"display_text":" Menu Utama","id":"${prefix}menu"}` },
                { name: "quick_reply", buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` },
              { name: "cta_url", buttonParamsJson: `{"display_text":"Chat Owner","url":"${global.linkown}","merchant_url":"${global.linkown}"}` }
            ]
          },
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "",
              serverMessageId: 1,
              newsletterName: "Click Saluran"
            }
          }
        }
      }
    }
  }, { userJid: m.sender, quoted: m })

  await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
break        
case "allmenu": {
  const hour = new Date().getHours()
  let ucapan
  if (hour < 10) ucapan = "pagi 🌅"
  else if (hour < 15) ucapan = "siang ☀️"
  else if (hour < 18) ucapan = "sore 🌇"
  else ucapan = "malam 🌙"
// --- LOGIC RATING (Taro sebelum teks menu) ---
const rt = JSON.parse(fs.readFileSync('./database/feedback.json'))
const allR = Object.values(rt.rates || {})
const totalRate = allR.length
const avg = totalRate ? (allR.reduce((a, b) => a + b.s, 0) / totalRate).toFixed(1) : "0.0"
  const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

乂  *DASHBOARD*
┏━━━━━━━━━━━━⟢
[⭐] *Rating:* ${avg}/10 (${totalRate} User)
[📌] *Info:* Ketik .rate & .req
┗━━━━━━━━━━━━⟢

*｢ TOOLS & IMAGE ｣*
┠─⊷ .smeme <text>
┠─⊷ .upscale <2/4>
┠─⊷ .removebg
┠─⊷ .hd 
┠─⊷ .toimg
┠─⊷ .tomp3
┠─⊷ .pinterest

*｢ DOWNLOADER ｣*
┠─⊷ .tiktok <url> 
┠─⊷ .spotify <url> 
┠─⊷ .ig <url>
┠─⊷ .play <judul> 
┠─⊷ .song <judul>  
┠─⊷ .ytmp3 <url> 
┠─⊷ .yts <query> 
┠─⊷ .ytmp4 <url> 

*｢ GROUP MANAGEMENT ｣*
┠─⊷ .promote Ⓐ
┠─⊷ .demote Ⓐ
┠─⊷ .grup open/close Ⓐ
┠─⊷ .rank / .lb
┠─⊷ .myinfo / .bio
┠─⊷ .cn <nama>
┠─⊷ .verif <username>
┠─⊷ .mute / .unmute
┠─⊷ .upsw
┠─⊷ .sider / .hidetag
┠─⊷ .kick / .dor
┠─⊷ .afk / .rvo

*｢ STICKER MAKER ｣*
┠─⊷ .brat / .bratvid
┠─⊷ .bratip / .sticker
┠─⊷ .smeme / .swm

*｢ SUPPORT ｣*
┠─⊷ .rate <1-10>|msg
┠─⊷ .req <features>

*Note:*
_Gunakan bot dengan bijak, error lapor owner_
_Muachh Love You 😘_`

  let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            ...(await prepareWAMessageMedia(
              { image: { url: getThumbnail() } },
              { upload: spark.waUploadToServer }
            ))
          },
          body: { text: teks },
          nativeFlowMessage: {
            buttons: [
              { name: "quick_reply", buttonParamsJson: `{"display_text":" Menu Utama","id":"${prefix}menu"}` },
               { name: "quick_reply", buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` },
              { name: "cta_url", buttonParamsJson: `{"display_text":"Chat Owner","url":"${global.linkown}","merchant_url":"${global.linkown}"}` }
            ]
          },
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "",
              serverMessageId: 1,
              newsletterName: "Click Saluran"
            }
          }
        }
      }
    }
  }, { userJid: m.sender, quoted: m })

  await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
break        
         
case "iqc": {
  if (!text || !text.includes("|"))
    return bales("❌ Format salah!\nContoh:\n.iqc 14:41|41|Annjng")

  let [time, battery, messageText] = text.split("|").map(v => (v || "").trim())
  if (!time || !battery || !messageText)
    return bales("❌ Isi semua!\n.iqc time|battery|message")
const provider = "Axis"
  try {
    const api =
      `https://apiz.rafzsoffc.cloud/imagecreator/iqc?apikey=zlynzeeapi` +
      `&time=${encodeURIComponent(time)}` +
      `&battery=${encodeURIComponent(battery)}` +
      `&messageText=${encodeURIComponent(messageText)}` +
      `&provider=${encodeURIComponent(provider)}`

    const res = await axios.get(api, { responseType: "arraybuffer" })
    const buf = Buffer.from(res.data)

    await spark.sendMessage(m.chat, { image: buf, caption: "✅ IQC berhasil dibuat!" }, { quoted: m })
  } catch (e) {
    bales("❌ Gagal buat IQC, coba lagi.")
  }
}
break        
        
case "downloadmenu": {
// Ambil waktu untuk ucapan
const hour = new Date().getHours();
let ucapan;
if (hour < 10) ucapan = "pagi 🌅";
else if (hour < 15) ucapan = "siang ☀️";
else if (hour < 18) ucapan = "sore 🌇";
else ucapan = "malam 🌙";

const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

*｢ DOWNLOADER ｣*
┠─⊷ .tiktok <url> 
┠─⊷ .spotify <url> 
┠─⊷ .ig <url>
┠─⊷ .play <judul> 
┠─⊷ .song <judul>  
┠─⊷ .ytmp3 <url> 
┠─⊷ .yts <query> 
┠─⊷ .ytmp4 <url> 

*Note:*
- Bila Ada Fitur Error Segera Laporkan Owner
- Tidak Tau Nomer Owner? Gunakan .owner
- Nomor Owner Berakhiran (9219), Antisipasi Jika Script Digunakan Oleh Orang lain`;

// Kirim pesan dengan gambar dan forward channel
let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    ...(await prepareWAMessageMedia({ 
                        image: { url: getThumbnail() } 
                    }, { upload: spark.waUploadToServer }))
                },
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: `{"display_text":" Menu Utama","id":".menu"}`
                        },
                         {
                          name: "quick_reply",
                           buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` 
                         },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Chat Owner","url":"${global.linkown}","merchant_url":"${global.linkown}"}`
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "",
                        serverMessageId: 1,
                        newsletterName: "Click Saluran"
                    }
                }
            }
        }
    }
}, { userJid: m.sender, quoted: m });

await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break        

case "ownermenu":
case "ownerm": {
    if (!isOwner) return bales(mess.admin);
    
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const teks = `Selamat ${ucapan} Owner 👑

乂  *OWNER MENU*
┏━━━━━━━━━━━━━━━━━⟢
[✦] .public / .self
[✦] .mode
[✦] .addowner
[✦] .delowner
[✦] .listowner
┗━━━━━━━━━━━━━━━━━⟢
*Note:* 
- Menu Owner Tidak di Show Semua Karena Jika Di Show Semua Takutnya Asal Pakai Dan Menyebabkan Error`;

    // Kirim sebagai interactive message
    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: getThumbnail() } 
                        }, { upload: spark.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":" Menu Utama","id":".menu"}`
                            },
                             { name: "quick_reply", buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"Chat Owner","url":"${global.linkown}","merchant_url":"${global.linkown}"}`
                            }
                        ]
                    },
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "",
                            serverMessageId: 1,
                            newsletterName: "Owner Menu"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break        
        
 case "stickermenu": {
const hour = new Date().getHours();
let ucapan;
if (hour < 10) ucapan = "pagi 🌅";
else if (hour < 15) ucapan = "siang ☀️";
else if (hour < 18) ucapan = "sore 🌇";
else ucapan = "malam 🌙";

const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

*｢ STICKER MAKER ｣*
┠─⊷ .brat / .bratvid
┠─⊷ .bratip / .sticker
┠─⊷ .smeme / .swm

Note:
- Bila Ada Fitur Error Segera Laporkan Owner
- Tidak Tau Nomor Owner? Gunakan .owner
- Nomor Owner Real Berakhiran (9219)`;

// Kirim pesan dengan gambar dan forward channel
let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    ...(await prepareWAMessageMedia({ 
                        image: { url: getThumbnail() } 
                    }, { upload: spark.waUploadToServer }))
                },
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: `{"display_text":" Menu Utama","id":".menu"}`
                        },
                         { name: "quick_reply", buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Click disini","url":"${global.idchannel}","merchant_url":"${global.idchannel}"}`
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "",
                        serverMessageId: 1,
                        newsletterName: "Click disini"
                    }
                }
            }
        }
    }
}, { userJid: m.sender, quoted: m });

await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break      
        
//###############################
case "swm": {
    // Cek apakah ada gambar yang dikirim atau di-reply
    const quotedMime = m.quoted?.msg?.mimetype || m.quoted?.mimetype;
    const isImage = quotedMime?.includes('image') || mime?.includes('image');
    
    if (!isImage) {
        return bales(`Kirim/Reply foto dengan caption: ${cmd} Author`);
    }
    
    if (!text) {
        return bales(`Format: ${cmd} Author\nContoh: ${cmd} MyName`);
    }
    
    try {
        const author = text
        
        // Ambil dari quoted atau dari message langsung
        const mediaObj = m.quoted || m;
        const mediaPath = await spark.downloadAndSaveMediaMessage(mediaObj);
        
        await spark.sendStimg(m.chat, mediaPath, m, {
            packname: '',
            author: author,
            categories: ['🤖', '🎨']
        });
        
        fs.unlinkSync(mediaPath);
        
    } catch (err) {
        console.error('SWM Error:', err);
        bales(`❌ Gagal membuat sticker dengan metadata: ${err.message}`);
    }
}
break
 
case "smeme": {

  if (!m.quoted || !/image/.test(m.quoted.mtype))
    return bales("❌ Reply foto dengan caption:\nsmeme teks atas|teks bawah")

  if (!text.includes("|"))
    return bales("❌ Format salah\nContoh:\nsmeme teks atas|teks bawah")

  let [top, bottom] = text.split("|")
  top = encodeURIComponent(top.trim())
  bottom = encodeURIComponent(bottom.trim())

  const imgBuffer = await m.quoted.download()

  const form = new FormData()
  form.append("files[]", imgBuffer, {
    filename: "image.jpg",
    contentType: "image/jpeg"
  })

  const upload = await axios.post("https://uguu.se/upload", form, {
    headers: form.getHeaders()
  })

  if (!upload.data?.files?.[0])
    return bales("❌ Gagal upload gambar")

  const imgUrl = upload.data.files[0].url

  const memeUrl =
    `https://api.memegen.link/images/custom/${top}/${bottom}.png?background=${encodeURIComponent(imgUrl)}`

  const memeImg = await axios.get(memeUrl, {
    responseType: "arraybuffer"
  })
  await spark.sendStimg(
    m.chat,
    memeImg.data,
    m,
    {
      packname: global.packname || "Smeme Generator",
      author: global.author || "ZyncDev"
    }
  )
}
break
 
case "cekkhodam": {
    if (!text) return bales(`Contoh: ${cmd} Ahmad`);
    
    
    const khodamList = [
        '🐯 Macan Putih', '🐉 Naga Hitam', '🦅 Elang Jawa',
        '🐍 Ular Naga', '🦁 Singa Barong', '🐺 Serigala Putih',
        '🐴 Kuda Sembrani', '👼 Malaikat Pelindung', '👹 Jin Ifrit',
        '🦇 Kelelawar Malam', '🐊 Buaya Putih', '🦚 Merak Emas',
        '🐅 Harimau Sumatera', '🦌 Rusa Bercahaya', '🦊 Rubah Putih',
        '❌ Kosong (Tidak Ada Khodam)'
    ];
    
    const random = khodamList[Math.floor(Math.random() * khodamList.length)];
    
    let replyText = `*🔮 CEK KHODAM*\n\n`;
    replyText += `👤 Nama: ${text}\n`;
    replyText += `✨ Khodam: ${random}\n\n`;
    
    if (random.includes('Kosong')) {
        replyText += `❌ Maaf, kamu tidak memiliki khodam pendamping.`;
    } else {
        replyText += `🌟 Khodam yang menjaga dan melindungimu!`;
    }
    
    bales(replyText);
}
break;

case "public": {
    if (!isOwner) return;
    
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");
    
    global.mode_public = true;
    spark.public = true;
    
    let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = true");
    fs.writeFileSync(path, newData, "utf-8");
    
    return bales("✅ Mode berhasil diubah menjadi *Public*");
}
break

case "self": {
    if (!isOwner) return;
    
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");
    
    global.mode_public = false;
    spark.public = false;
    
    let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = false");
    fs.writeFileSync(path, newData, "utf-8");
    
    return bales("✅ Mode berhasil diubah menjadi *Self*");
}
break

case "botmode":
case "mode": {
    const currentMode = global.mode_public ? "PUBLIC" : "SELF";
    
    const teks = `🤖 *BOT MODE*\n\n` +
                `Mode saat ini: *${currentMode}*\n\n` +
                `Perintah untuk mengubah mode:\n` +
                `${prefix}public - Ubah ke mode public\n` +
                `${prefix}self - Ubah ke mode self`;
    
    bales(teks);
}
break        

case "grup":
case "group": {
    if (!m.isGroup) return bales("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return bales("❌ Khusus admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['open', 'close'].includes(status)) {
        return bales(`Contoh:\n${prefix}grup open\n${prefix}grup close`);
    }
    
    try {
        await spark.groupSettingUpdate(m.chat, status === 'open' ? 'not_announcement' : 'announcement');
        bales(`✅ Grup berhasil di${status === 'open' ? 'buka' : 'tutup'}!\n\n${status === 'open' ? '🔓 Semua member bisa kirim pesan' : '🔒 Hanya admin yang bisa kirim pesan'}`);
    } catch (err) {
        console.error('Grup Error:', err);
        bales("❌ Gagal mengubah setting grup!");
    }
}
break;        
  
case "closegcauto":
case "autogc": {
    if (!m.isGroup) return bales("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return bales("❌ Khusus admin!");;
    
    if (!text) return bales(`Contoh: ${prefix}closegcauto 00:00 | 06:00\n\nFormat: Jam Tutup | Jam Buka`);
    
    const [closeTime, openTime] = text.split('|').map(t => t.trim());
    
    if (!closeTime || !openTime) {
        return bales(`❌ Format salah!\nContoh: ${prefix}closegcauto 00:00 | 06:00`);
    }
    
    // Validasi format waktu
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(closeTime) || !timeRegex.test(openTime)) {
        return bales("❌ Format waktu salah! Gunakan format HH:MM (24 jam)");
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].autoClose = closeTime;
    groupSettings[m.chat].autoOpen = openTime;
    
    fs.writeFileSync('./database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    bales(`✅ Auto Close/Open berhasil diatur!\n\n🔒 Tutup: ${closeTime}\n🔓 Buka: ${openTime}\n\n⏰ Bot akan otomatis tutup/buka grup sesuai jadwal!`);
}
break;        
case "promote":
case "demote": {
  if (!m.isGroup) return bales("❌ Fitur ini khusus grup!")
  if (!isAdmin && !isOwner) return bales("❌ Khusus admin/owner!")
  

  // Ambil target (Urutan: Reply -> Mention -> Ketik angka)
  let target = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  
  if (!target || target.length < 15) return bales("❌ Tag/Reply/Ketik nomor targetnya!")

  const action = command === "promote" ? "promote" : "demote"
  const label = command === "promote" ? "Admin" : "Member"

  await spark.groupParticipantsUpdate(m.chat, [target], action)
  
  // Kasih delay dikit biar WhatsApp sempet proses status adminnya
  await new Promise(resolve => setTimeout(resolve, 1000))

  await spark.sendMessage(m.chat, {
    text: `✅ @${target.split("@")[0]} berhasil di-${command} menjadi ${label}!`,
    mentions: [target] // Ini kuncinya biar tag biru muncul
  }, { quoted: m })
}
break
case "upscale": {

  if (!m.quoted || !/image/.test(m.quoted.mtype))
    return bales("❌ Reply foto dengan perintah: .upscale 2 / .upscale 4")

  let scale = parseInt((text || "2").trim())
  if (![2, 4].includes(scale)) scale = 2

  try {
    const imgUrl = await uguu.uploadFromMessage(m.quoted)
    const api = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(imgUrl)}&scale=${scale}`
    const outBuf = await uguu.apiToBuffer(api)

    await uguu.sendImage(spark, m.chat, outBuf, m, `✅ Upscale x${scale} selesai!`)
  } catch (e) {
    bales("❌ Gagal upscale.")
  }
}
break        
 case "faceswap": {
  const q2 = m.quoted
  if (!q2 || !/image/.test(q2.mtype))
    return bales("❌ Reply Foto 2.\n(Foto 2 harus reply Foto 1 dulu)")

  const q1 = q2.quoted
  if (!q1 || !/image/.test(q1.mtype))
    return bales("❌ Foto 2 harus reply ke Foto 1.\nLalu kamu reply Foto 2 dengan .faceswap")

  try {
    const url1 = await uguu.uploadFromMessage(q1)
    const url2 = await uguu.uploadFromMessage(q2)

    const api = `https://api.siputzx.my.id/api/imgedit/faceswap?image1=${encodeURIComponent(url1)}&image2=${encodeURIComponent(url2)}`
    const outBuf = await uguu.apiJsonToBuffer(api)

    

    await uguu.sendImage(spark, m.chat, outBuf, m, "✅ Faceswap selesai!")
  } catch (e) {
    bales("❌ Gagal faceswap.")
  }
}
break      
case "removebg": {
  if (!m.quoted || !/image/.test(m.quoted.mtype))
    return bales("❌ Reply foto dengan perintah: .removebg")
  try {
    const imgUrl = await uguu.uploadFromMessage(m.quoted)
    const api = `https://apiz.rafzsoffc.cloud/imagecreator/removebg?apikey=zlynzeeapi&url=${encodeURIComponent(imgUrl)}`
    // bisa file langsung / bisa json (kita handle)
    let outBuf = await uguu.apiToBuffer(api)
    const js = uguu.tryParseJsonBuffer(outBuf)
    if (js) {
      const outUrl = js.data || js.result || js.url
      if (!outUrl) return bales("❌ Gagal removebg (output kosong).")
      outBuf = await uguu.getBuffer(outUrl)
    }
    await uguu.sendImage(spark, m.chat, outBuf, m, "✅ RemoveBG selesai!")
  } catch (e) {
    bales("❌ Gagal removebg.")
  }
}
break        

case "grupmenu": {
    if (!m.isGroup) return bales("❌ Fitur ini khusus grup!")

    const hour = new Date().getHours()
    let ucapan
    if (hour < 10) ucapan = "pagi 🌅"
    else if (hour < 15) ucapan = "siang ☀️"
    else if (hour < 18) ucapan = "sore 🌇"
    else ucapan = "malam 🌙"

    const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

*｢ GROUP MANAGEMENT ｣*
┠─⊷ .promote Ⓐ
┠─⊷ .demote Ⓐ
┠─⊷ .grup open/close Ⓐ
┠─⊷ .rank / .lb
┠─⊷ .myinfo / .bio
┠─⊷ .cn <nama>
┠─⊷ .verif <username>
┠─⊷ .mute / .unmute
┠─⊷ .upsw
┠─⊷ .sider / .hidetag
┠─⊷ .kick / .dor
┠─⊷ .afk / .rvo

*Note:*
- Bila Menemukan Fitur Error, Segera Laporkan Kepada owner
- Tidak tau nomor owner? gunakan .owner`

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia(
                            { image: { url: getThumbnail() } },
                            { upload: spark.waUploadToServer }
                        ))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            { name: "quick_reply", buttonParamsJson: `{"display_text":" Menu Utama","id":"${prefix}menu"}` },
                             { name: "quick_reply", buttonParamsJson: `{"display_text":"Info Update","id":"${prefix}infoupdate"}` },
                            { name: "cta_url", buttonParamsJson: `{"display_text":"Chat Owner","url":"${global.linkown}","merchant_url":"${global.linkown}"}` }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "",
                            serverMessageId: 1,
                            newsletterName: "Click Saluran"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m })

    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
break                                                                                                                                                                                                                
case "tiktok": {
if (!text) return bales("Masukkan URL TikTok!\n\nContoh: .tiktok https://vt.tiktok.com/ZSxxx");
bales("🔄 Sedang mengunduh video TikTok...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/tiktok-v2?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return bales("❌ Gagal mengunduh video TikTok!");
    
    const data = json.result.data;
    
    const caption = `*TIKTOK DOWNLOADER*

👤 Author: ${data.author.nickname} (@${data.author.unique_id})
📝 Title: ${data.title}

📊 Statistics:
❤️ Likes: ${data.digg_count.toLocaleString()}
💬 Comments: ${data.comment_count.toLocaleString()}
🔄 Shares: ${data.share_count.toLocaleString()}
👁️ Views: ${data.play_count.toLocaleString()}
`;

    // Kirim video dengan button
    await spark.sendMessage(m.chat, {
        video: { url: data.play },
        caption: caption,
        contextInfo: {
            externalAdReply: {
                title: "TIKTOK DOWNLOADER",
                body: data.author.nickname,
                thumbnailUrl: data.cover,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    // Kirim button terpisah
    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: "Pilih opsi di bawah ini:" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"🎵 Download Audio","id":".ttmp3 ${text}"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📺 Lihat di TikTok","url":"${text}","merchant_url":"${text}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });
    
    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
} catch (error) {
    console.log(error);
    bales("❌ Terjadi kesalahan saat mengunduh video!");
}
}
break                           
case "ttmp3": {
if (!text) return bales("Masukkan URL TikTok!\n\nContoh: .ttmp3 https://vt.tiktok.com/ZSxxx");

bales("🎵 Sedang mengunduh audio TikTok...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/tiktok-v2?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return bales("❌ Gagal mengunduh audio TikTok!");
    
    const data = json.result.data;
    // Kirim audio
    await spark.sendMessage(m.chat, {
        audio: { url: data.music },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
            externalAdReply: {
                title: data.music_info.title,
                body: data.music_info.author,
                thumbnailUrl: data.music_info.cover,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    
} catch (error) {
    console.log(error);
    bales("❌ Terjadi kesalahan saat mengunduh audio!");
}
}
break
case "bratip": {
    if (!text) return bales(`*Contoh :* ${cmd} Hallo Aku Jawa!`);
    
    var media = await getBuffer(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`);
    
    await spark.sendStimg(m.chat, media, m, {packname: "AfaIYah??"});
}
break        
// Spotify Downloader
case "spotify": {
if (!text) return bales("Masukkan URL Spotify!\n\nContoh: .spotify https://open.spotify.com/track/xxx");

bales("🎵 Sedang mengunduh audio Spotify...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://www.velyn.mom/api/downloader/spotify?apikey=velynapis&url=${url}`);
    const json = await res.json();
    
    if (json.status !== 200) return bales("❌ Gagal mengunduh audio Spotify!");
    
    const data = json.data;
    
    
    const caption = `*SPOTIFY DOWNLOADER*

🎵 Title: ${data.title}
👤 Artist: ${data.artists}
⏱️ Duration: ${Math.floor(data.duration / 1000 / 60)}:${Math.floor((data.duration / 1000) % 60)}
`;

    await spark.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        contextInfo: {
            externalAdReply: {
                title: data.title,
                body: data.artists,
                thumbnailUrl: data.thumbnail,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    bales("❌ Terjadi kesalahan saat mengunduh audio Spotify!");
}
}
break;
        
case "cekidch":
case "idch": {
    if (!text) return bales(`*Contoh :* ${cmd} link channel`); 
    if (!text.includes("https://whatsapp.com/channel/")) {
        return bales("Link channel tidak valid");
    }

    let result = text.split("https://whatsapp.com/channel/")[1];
    let res = await spark.newsletterMetadata("invite", result);
    let teks = `*Channel ID Ditemukan ✅*\n\n- ${res.id}`;

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Channel ID","copy_code":"${res.id}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break
//────────「SPARKLE」────────//

case "tourl": {
    if (!/image|video|audio|application/.test(mime)) 
        return bales(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim media`)

    const FormData = require('form-data');
    const { fromBuffer } = require('file-type');    

    async function dt(buffer) {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        let { ext } = await fromBuffer(buffer);
        let bodyForm = new FormData();
        bodyForm.append("fileToUpload", buffer, "file." + ext);
        bodyForm.append("reqtype", "fileupload");
        let res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: bodyForm,
        });
        let data = await res.text();
        return data;
    }

    let aa = m.quoted ? await m.quoted.download() : await m.download();
    let dd = await dt(aa);

    // bikin button copy url
    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: `✅ Media berhasil diupload!\n\nURL: ${dd}` },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy", 
                                buttonParamsJson: `{"display_text":"Copy URL","copy_code":"${dd}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//────────「SPARKLE」────────//

case "tourl2": {
    if (!/image/.test(mime)) 
        return bales(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim foto`)
    try {
        const { ImageUploadService } = require('node-upload-images');
        let mediaPath = await spark.downloadAndSaveMediaMessage(qmsg);
        const service = new ImageUploadService('pixhost.to');
        let buffer = fs.readFileSync(mediaPath);
        let { directLink } = await service.uploadFromBinary(buffer, '.png');
        await fs.unlinkSync(mediaPath);

        // button copy url
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `✅ Foto berhasil diupload!\n\nURL: ${directLink}` },
                        nativeFlowMessage: {
                            buttons: [
                                { 
                                    name: "cta_copy", 
                                    buttonParamsJson: `{"display_text":"Copy URL","copy_code":"${directLink}"}`
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await spark.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error("Tourl Error:", err);
        bales("Terjadi kesalahan saat mengubah media menjadi URL.");
    }
}
break;

//────────「SPARKLE」────────//

case "backupsc":
case "bck":
case "backup": {
    if (m.sender.split("@")[0] !== global.owner)
        return bales(mess.owner);
    try {        
        const tmpDir = "./sampah";
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
            for (let file of files) {
                fs.unlinkSync(`${tmpDir}/${file}`);
            }
        }
        await bales("Processing Backup Script . .");        
        const name = `Backup Sparkle MD`; 
        const exclude = ["node_modules", "sesi", "session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
        const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

        if (!filesToZip.length) return bales("Tidak ada file yang dapat di-backup.");

        execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

        await spark.sendMessage(m.sender, {
            document: fs.readFileSync(`./${name}.zip`),
            fileName: `${name}.zip`,
            mimetype: "application/zip"
        }, { quoted: m });

        fs.unlinkSync(`./${name}.zip`);

        if (m.chat !== m.sender) bales("Script bot berhasil dikirim ke private chat.");
    } catch (err) {
        console.error("Backup Error:", err);
        bales("Terjadi kesalahan saat melakukan backup.");
    }
}
break;

//────────「SPARKLE」────────//

case "kick":
case "kik": {
    if (!m.isGroup) return bales(mess.group);
    if (!isOwner && !m.isAdmin) return bales(mess.admin);
    if (!m.isBotAdmin) return bales(mess.botadmin);

    let target;

    if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        target = m.quoted.sender;
    } else if (text) {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned) target = cleaned + "@s.whatsapp.net";
    }

    if (!target) return bales(`*Contoh :* .kick @tag/6283XXX`);

    try {
        await spark.groupParticipantsUpdate(m.chat, [target], "remove");
        return spark.sendMessage(m.chat, {
            text: `✅ Berhasil mengeluarkan @${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: m });
    } catch (err) {
        console.error("Kick error:", err);
        return bales("Gagal mengeluarkan anggota. Coba lagi atau cek hak akses bot.");
    }
}
break;
//────────「SPARKLE」────────//



case "sticker": case "stiker": case "sgif": case "s": {
if (!/image|video/.test(mime)) return bales("Kirim foto dengan caption .sticker")
if (/video/.test(mime)) {
if ((qmsg).seconds > 15) return bales("Durasi vidio maksimal 15 detik!")
}
var media = await spark.downloadAndSaveMediaMessage(qmsg)
await spark.sendStimg(m.chat, media, m, {packname: "Xskycode."})
}
break

//────────「SPARKLE」────────//

case "public":
case "self": {
    if (!isOwner) return bales(mess.owner);
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");

    if (command === "public") {
        global.mode_public = true;
        spark.public = global.mode_public
        let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = true");
        fs.writeFileSync(path, newData, "utf-8");
        return bales("✅ Mode berhasil diubah menjadi *Public*");
    }

    if (command === "self") {
        global.mode_public = false;
        spark.public = global.mode_public
        let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = false");
        fs.writeFileSync(path, newData, "utf-8");
        return bales("✅ Mode berhasil diubah menjadi *Self*");
    }
}
break;
l

//────────「SPARKLE」────────//

case "own": case "owner": {
await spark.sendContact(m.chat, [global.owner], global.namaOwner, "Developer Bot", m)
}
break

//────────「SPARKLE」────────//

default:
const targetLinks = ['vt.tiktok.com', 'vm.tiktok.com', 'www.tiktok.com'];
// ==== BAGIAN DETEK LINK TIKTOK ====
// SKIP AUTO DETECTOR JIKA COMMAND .tiktok
if (m.text && targetLinks.some(link => m.text.includes(link))) {
  try {
    if (!db) db = {};
    if (!db[m.chat]) db[m.chat] = {};
    if (db[m.chat].tiktokdetector === undefined)
      db[m.chat].tiktokdetector = false;
    if (!db[m.chat].tiktokdetector) return;
    const detekData = loadDetek();
    if (!detekData[m.chat]) detekData[m.chat] = { tiktokHashtags: [], cnFonts: [] };
    const groupSettings = detekData[m.chat];
    const url = m.text.match(/https?:\/\/[^\s]+/g)?.[0];

          if (!url) return;
    const res = await axios.get(`https://api.hanggts.xyz/download/tiktok-v2?url=${encodeURIComponent(url)}`, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Android 11; Mobile; rv:144.0) Gecko/144.0 Firefox/144.0' },
  timeout: 8000 // 10 detik

});
    if (!res.data?.status) return;
    const d = res.data.result.data;
   const nickname = d.author?.nickname || '-';
    const username = d.author?.unique_id || '-';
const usedTags = groupSettings.tiktokHashtags.filter(h => d.title?.includes(h));
const unusedTags = groupSettings.tiktokHashtags.filter(h => !d.title?.includes(h));
const captionText = `
─ 𝐍𝐢𝐜𝐤𝐍𝐚𝐦𝐞   : ${nickname}
─ 𝐔𝐬𝐞𝐫𝐍𝐚𝐦𝐞   : @${username}

─ 𝐂𝐚𝐩𝐭𝐢𝐨𝐧
${d.title || '—'}

┌ 𝐒𝐭𝐚𝐭𝐮𝐬 𝐇𝐚𝐬𝐭𝐚𝐠
│ 𝐃𝐞𝐭𝐞𝐤𝐬𝐢      : ${usedTags.length ? 'sebagian cocok' : 'tidak ada yang sesuai'}
│ 𝐃𝐢𝐩𝐚𝐤𝐚𝐢     : ${usedTags.length ? usedTags.join(', ') : '—'}
│ 𝐓𝐢𝐝𝐚𝐤 𝐝𝐢𝐩𝐚𝐤𝐚𝐢 : ${unusedTags.length ? unusedTags.join(', ') : '—'}
└
`;
 const detected = usedTags.length > 0;
await spark.sendMessage(m.chat, { react: { text: detected ? '✅' : '❌', key: m.key } });     
const buttons = [
      { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Buka TikTok", url: url }) }
    ];
 await spark.sendMessage(
      m.chat,
      {
        product: {
          productImage: { url: ppUrl  },
          productId: "998877665544332211",
          title: `       「✦ 𝐃𝐄𝐓𝐄𝐊𝐒𝐈 𝐕𝐓 ✦」`,
          description: '',
          currencyCode: "",
          priceAmount1000: "0",
          retailerId: "",
          url: url,
          productImageCount: 1
        },
        businessOwnerJid: m.sender,
        caption: captionText,
        title: "",
        subtitle: "",
        footer: "",
        hasMediaAttachment: true,
        interactiveButtons: buttons
      },
      { quoted: m }
    );
} catch (err) {
    console.log(chalk.red('[❌ Error TikTok Deteksi]'), err);
    await spark.sendMessage(m.chat, { text: `⚠️ Error TikTok Deteksi: ${err.message}` });
  }
}     
if (m.text.toLowerCase().startsWith("xx")) {
    if (m.sender.split("@")[0] !== global.owner) return 
    try {
        const result = await eval(`(async () => { ${text} })()`);
        const output = typeof result !== "string" ? util.inspect(result) : result;
        return spark.sendMessage(m.chat, { text: util.format(output) }, { quoted: m });
    } catch (err) {
        return spark.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//────────「SPARKLE」────────//

if (m.text.toLowerCase().startsWith("x")) {
    if (m.sender.split("@")[0] !== global.owner) return 

    try {
        let result = await eval(text);
        if (typeof result !== "string") result = util.inspect(result);
        return spark.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
    } catch (err) {
        return spark.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//────────「SPARKLE」────────//

if (m.text.startsWith('$')) {
    if (!isOwner) return;
    
    exec(m.text.slice(2), (err, stdout) => {
        if (err) {
            return spark.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
        }
        if (stdout) {
            return spark.sendMessage(m.chat, { text: util.format(stdout) }, { quoted: m });
        }
    });
}

}

} catch (err) {
console.log(err)
await spark.sendMessage(global.owner+"@s.whatsapp.net", {text: err.toString()}, {quoted: m ? m : null })
}}

//────────「SPARKLE」────────//

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
    delete require.cache[file];
    require(file);
});