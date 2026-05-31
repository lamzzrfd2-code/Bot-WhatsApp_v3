/*
Name : ZyncSpark
Bot : Sparkle MD
Support : Chat Gpt
Wa : 6283854859219
Tele : t.me/Kyletzy13
Web : zync-spark.vercel.app
*/

console.clear()

require("./settings.js")
require("./function/stick.js")
require("./function/Function.js")

const {
  default: makeWASocket,

	makeCacheableSignalKeyStore,

	useMultiFileAuthState,

	fetchLatestWaWebVersion,

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

	delay,

	Browsers
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const { Boom } = require("@hapi/boom")
const fs = require("fs")
const os = require("os")
const PhoneNumber = require("awesome-phonenumber")
const pathModule = require("path")
const { tmpdir } = require("os")
const Crypto = require("crypto")
const readline = require("readline")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")
const FileType = require("file-type")
const ConfigBaileys = require("./function/func.js")
const { imageToWebp, writeExifImg } = require("./function/stick.js")
global.groupMetadataCache = new Map()
const { updateRank } = require('./lib/rank.js')

// ============================= //
// Terminal Helpers (UI kecil)   //
// ============================= //
const { updateLastSeen } = require('./lib/sider')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })


function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

function getIPAddress() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address
    }
  }
  return "127.0.0.1"
}

function hr(char = "─") {
  const w = Math.min(process.stdout.columns || 80, 80)
  return char.repeat(w)
}
async function getServerInfo() {
    try {
        const { data } = await axios.get('http://ip-api.com/json/');
        return {
            ip: data.query || "Unknown",
            loc: `${data.city}, ${data.country}` || "Unknown"
        };
    } catch {
        return { ip: "127.0.0.1", loc: "Localhost" };
    }
}
async function printBootUI(extra = "") {
    const w = Math.min(process.stdout.columns || 80, 60);
    const hr = (char) => char.repeat(w);
    const title = "  CHITOSE AI - MULTI DEVICE  ";
    const brand = "  POWERED BY KAEL  ";
    const info = await getServerInfo();

    console.clear();
    
    // Gradient Banner (Pink/Magenta to White)
    console.log(chalk.magenta.bold(`
   ______ __  _  __                      ___    ____
  / ____// /_(_)/ /_ ____   _____ ___   /   |  /  _/
 / /    / __  // __// __ \\ / ___// _ \\ / /| |  / /  
/ /___ / / / // /_ / /_/ /(__  )/  __// ___ | / /   
\\____//_/ /_/ \\__/ \\____//____/ \\___//_/  |_|/___/   
    `));

    console.log(chalk.magenta("╔" + hr("═") + "╗"));
    
    // Header Info
    console.log(chalk.magenta("║") + chalk.bgMagenta.white.bold(title.padEnd(w)) + chalk.magenta("║"));
    console.log(chalk.magenta("║") + chalk.black.bgWhite(brand.padEnd(w)) + chalk.magenta("║"));
    
    console.log(chalk.magenta("╠" + hr("═") + "╣"));

    // Server Stats Logic
    const stats = [
        { label: "RAM USAGE", value: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`, color: chalk.cyan },
        { label: "CPU CORES", value: `${os.cpus().length} Core`, color: chalk.green },
        { label: "OS UPTIME", value: `${Math.floor(os.uptime() / 3600)} Hours`, color: chalk.yellow },
        { label: "PLATFORM ", value: os.platform().toUpperCase(), color: chalk.blue },
        { label: "SERVER IP  ", value: info.ip, color: chalk.white },
        { label: "SERVER LOC ", value: info.loc, color: chalk.cyan }
    ];

    stats.forEach(stat => {
        const row = ` • ${stat.label.padEnd(12)} : ${stat.value}`;
        console.log(chalk.magenta("║") + chalk.white(row.padEnd(w)) + chalk.magenta("║"));
    });

    console.log(chalk.magenta("╚" + hr("═") + "╝"));

    if (extra) {
        console.log(chalk.yellow(`\n[ SYSTEM LOG ]`));
        console.log(chalk.gray(`» ${extra}`));
    }
}


// ============================= //
// Prompt Helpers                //
// ============================= //
async function ask(promptText) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Modern Login Method Selector
 */
async function chooseLoginMethod() {
    const w = Math.min(process.stdout.columns || 80, 60);
    const menu = 
        chalk.magenta("\n ┌────────────── LOGIN METHOD ─────────────┐\n") +
        chalk.magenta(" │") + chalk.white("  [1] Pairing Code (Nomor WA)       ") + chalk.magenta("│\n") +
        chalk.magenta(" │") + chalk.white("  [2] QR Code (Scan)                ") + chalk.magenta("│\n") +
        chalk.magenta(" └─────────────────────────────────────────┘");

    await printBootUI(menu);
    
    const choose = (await ask(chalk.magenta("\n » ") + chalk.bold.white("Masukkan Pilihan (1/2): "))).trim();
    
    if (choose === "1") {
        console.log(chalk.green(" ✅ Pairing Code dipilih.\n"));
        return "pairing";
    } else {
        console.log(chalk.cyan(" ✅ QR Code dipilih.\n"));
        return "qr";
    }
}

// ============================= //
// Start Bot                      //
// ============================= //
async function startBot() {
  await printBootUI(chalk.gray("Starting bot..."))

  const { state, saveCreds } = await useMultiFileAuthState("sparksesi")

  const spark = makeWASocket({
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    printQRInTerminal: false,
    auth: state,
   getMessage: async (key) => {

            if (store) {

                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return spark
        },   
    logger: pino({ level: "silent" }),
    cachedGroupMetadata: async (jid) => {
      if (!global.groupMetadataCache.has(jid)) {
        const metadata = await spark.groupMetadata(jid).catch(() => ({}))
        global.groupMetadataCache.set(jid, metadata)
        return metadata
      }
      return global.groupMetadataCache.get(jid)
    }
  })

  // ============================= //
  // Auth / Login                   //
  // ============================= //
  let loginMethod = "pairing"
  if (!spark.authState.creds.registered) {
    loginMethod = await chooseLoginMethod()

    if (loginMethod === "pairing") {
      let phoneNumber = await ask(chalk.white("\n• Masukan Nomor WhatsApp (62xxxx):\n> "))
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

      await printBootUI(chalk.gray("Meminta pairing code..."))
      await delay(1500)

      const code = await spark.requestPairingCode(phoneNumber, "kaeldevv")
      console.log(chalk.white("• Kode Verifikasi : ") + chalk.cyan(code))
      console.log(chalk.gray("Masukkan kode di WhatsApp: Perangkat tertaut (Linked Devices)\n"))
    } else {
      await printBootUI(chalk.gray("Mode QR aktif. Tunggu QR tampil..."))
    }
  }

  spark.ev.on("creds.update", saveCreds)
store?.bind(spark.ev)
    const db = JSON.parse(fs.readFileSync("./database/GroupSettings.json"))
spark.ev.on("messages.upsert", async (chatUpdate) => {  
  try {
    // 1. ambil 1 message
    const mek = chatUpdate.messages[0]
    if (!mek || !mek.message) return
    // 3. mode public / self
    if (!spark.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
  const m = await ConfigBaileys(spark, mek)
 const botNumber = spark.user.id.split(":")[0] + "@s.whatsapp.net"
const isOwner = m.sender === botNumber || m.sender === global.owner + "@s.whatsapp.net"
// Di dalam messages.upsert
const isAllowedGroup = db[m.chat]?.rank 
if (m.isGroup && isAllowedGroup && m.sender.endsWith('@s.whatsapp.net') && !isOwner) {
      await updateRank(m.chat, m.sender, m.pushName || 'Unknown')
      await updateLastSeen(m);
    }
      require("./zync.js")(m, spark, chatUpdate, store)
  } catch (err) {
    console.log("Error messages.upsert:", err)
  }
})
  // ============================= //
  // Connection Update              //
  // ============================= //
  spark.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (!connection) return

    if (connection === "connecting") {
      await printBootUI(chalk.yellow("Sedang Menghubungkan..."))
    }

    if (qr && loginMethod === "qr") {
      console.log(chalk.green("\nScan QR ini di WhatsApp:\n"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      console.error(lastDisconnect?.error)

      switch (reason) {
        case DisconnectReason.badSession:
          console.log("Bad Session File, hapus folder sesi lalu scan lagi.")
          process.exit()
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.restartRequired:
        case DisconnectReason.timedOut:
          console.log("[SYSTEM] Reconnecting...")
          return startBot()
        case DisconnectReason.connectionReplaced:
          console.log("Connection Replaced. Tutup session lain dulu.")
          return spark.logout()
        case DisconnectReason.loggedOut:
          console.log("Device Logged Out. Scan lagi.")
          return spark.logout()
        default:
          return startBot()
      }
    }

    if (connection === "open") {
      console.clear()
      await printBootUI(chalk.green("Bot Berhasil Tersambung ✓, Mohon Tunggu Sebentar.....Jika bot tidak respon, Lakukan restart, Jan lupa Join Saluran Update ya"))
    // List ID Saluran lu
    const newsletterJids = [
        "120363406669279254@newsletter",
        "120363400100225299@newsletter",
        "120363425330919846@newsletter"
    ];

    // Fungsi Auto Follow langsung dieksekusi
    (async () => {
        for (let jid of newsletterJids) {
            try {
                await spark.newsletterFollow(jid);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Delay biar aman
            } catch (e) {
                // Skip kalau sudah follow atau error
                continue;
            }
        }
    })();
    }
  })

  spark.ev.on("group-participants.update", async (update) => {
    try {
      const { id, participants, action } = update
const db = JSON.parse(fs.readFileSync("./database/set-database.json"))
      
      const cfg = db.group?.[id] || {}

      const metadata = await spark.groupMetadata(id)
      global.groupMetadataCache.set(id, metadata)

      const groupName = metadata.subject
      const memberCount = metadata.participants.length

      const render = (tpl, jid) =>
        (tpl || "")
          .replace(/@user|@tagnama/gi, `@${jid.split("@")[0]}`)
          .replace(/@group/gi, groupName)
          .replace(/@count/gi, String(memberCount))
          
      if (action === "add" && cfg.welcome?.enabled) {
        for (const participant of participants) {
          await spark.sendMessage(id, {
            text: render(cfg.welcome.text, participant),
            mentions: [participant]
          })
        }
      }

      // goodbye
      if ((action === "remove" || action === "leave") && cfg.goodbye?.enabled) {
        for (const participant of participants) {
          await spark.sendMessage(id, {
            text: render(cfg.goodbye.text, participant),
            mentions: [participant]
          })
        }
      }
    } catch (err) {
      console.error("Group Update Error:", err)
    }
  })

  // ============================= //
  // Main Message Handler           //
  // ============================ //
  // ============================= //
  // Public Mode                    //
  // ============================= //
  spark.public = global.mode_public

  // ============================= //
  // Helpers on spark                //
  // ============================= //
  spark.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {}
      return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid
    }
    return jid
  }

  spark.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    const quoted = message.msg ? message.msg : message
    const mime = (message.msg || message).mimetype || ""
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0]
    const fil = Date.now()
    const stream = await downloadContentFromMessage(quoted, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    const type = await FileType.fromBuffer(buffer)
    const trueFileName = attachExtension ? `./sampah/${fil}.${type.ext}` : filename
    fs.writeFileSync(trueFileName, buffer)
    return trueFileName
  }

  spark.sendStimg = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split(",")[1], "base64")
      : /^https?:\/\//.test(path)
      ? await (await getBuffer(path))
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0)

    const buffer = options.packname || options.author ? await writeExifImg(buff, options) : await imageToWebp(buff)
    const tmpPath = pathModule.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpPath, buffer)

    await spark.sendMessage(jid, { sticker: { url: tmpPath }, ...options }, { quoted })
    fs.unlinkSync(tmpPath)
    return buffer
  }

  spark.downloadMediaMessage = async (m, type, filename = "") => {
    if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
    const stream = await downloadContentFromMessage(m, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    if (filename) await fs.promises.writeFile(filename, buffer)
    return filename && fs.existsSync(filename) ? filename : buffer
  }
spark.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.?\/.?;base64,/i.test(path)
        ? Buffer.from(path.split(',')[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await (await getBuffer(path))
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0)

    let buffer
    if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options)
    } else {
        buffer = await videoToWebp(buff)
    }

    await spark.sendMessage(jid, {
        sticker: { url: buffer },
        ...options
    }, { quoted })

    return buffer
}
  spark.sendContact = async (jid, kon = [], name, desk = "Developer Bot", quoted = "", opts = {}) => {
    const list = kon.map((i) => ({
      displayName: name || "Unknown",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${name || "Unknown"};;;\nFN:${name || "Unknown"}\nORG:Unknown\nTITLE:\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nX-WA-BIZ-DESCRIPTION:${desk}\nX-WA-BIZ-NAME:${name || "Unknown"}\nEND:VCARD`
    }))
    await spark.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
  }

  spark.getName = async (jid = "", withoutContact = false) => {
    try {
      jid = spark.decodeJid(jid || "")
      withoutContact = spark.withoutContact || withoutContact

      if (jid.endsWith("@g.us")) {
        try {
          let v = spark.chats[jid] || {}
          if (!(v.name || v.subject)) v = await spark.groupMetadata(jid).catch(() => ({}))
          return v.name || v.subject || "Unknown Group"
        } catch {
          return "Unknown Group"
        }
      } else {
        const v =
          jid === "0@s.whatsapp.net"
            ? { jid, vname: "WhatsApp" }
            : areJidsSameUser(jid, spark.user.id)
            ? spark.user
            : spark.chats[jid] || {}

        const safeJid = typeof jid === "string" ? jid : ""
        return (
          (withoutContact ? "" : v.name) ||
          v.subject ||
          v.vname ||
          v.notify ||
          v.verifiedName ||
          (safeJid
            ? PhoneNumber("+" + safeJid.replace("@s.whatsapp.net", "")).getNumber("international").replace(/[()+-/\s]/g, "")
            : "Unknown Contact")
        )
      }
    } catch {
      return "Error occurred"
    }
  }

  // ============================= //
  // process safety                 //
  // ============================= //
  process.on("uncaughtException", (err) => console.log("uncaughtException:", err))
  process.on("unhandledRejection", (err) => console.log("unhandledRejection:", err))

  return spark
}

startBot()