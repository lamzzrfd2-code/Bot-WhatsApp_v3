// lib/uggu.js
"use strict"

const axios = require("axios")
const FormData = require("form-data")

async function upload(buffer, opt = {}) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const filename = opt.filename || "image.jpg"
  const contentType = opt.contentType || "image/jpeg"

  const form = new FormData()
  form.append("files[]", buf, { filename, contentType })

  const res = await axios.post("https://uguu.se/upload", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 60_000
  })

  const file = res?.data?.files?.[0]
  if (!file?.url) throw new Error("UGUU_UPLOAD_FAILED")
  return file.url
}

async function uploadFromMessage(msg, opt = {}) {
  if (!msg?.download) throw new Error("INVALID_MESSAGE_DOWNLOAD")
  const dl = await msg.download()
  const buf = Buffer.isBuffer(dl) ? dl : Buffer.from(dl)
  return upload(buf, {
    filename: opt.filename || "image.jpg",
    contentType: opt.contentType || "image/jpeg"
  })
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60_000 })
  return Buffer.from(res.data)
}

async function apiToBuffer(apiUrl) {
  return getBuffer(apiUrl)
}

async function apiJsonToBuffer(apiUrl) {
  const { data } = await axios.get(apiUrl, { timeout: 60_000 })
  const outUrl = data?.data || data?.result || data?.url
  if (!outUrl) throw new Error("API_OUTPUT_URL_EMPTY")
  return getBuffer(outUrl)
}

async function sendImage(sock, jid, buffer, quoted, caption) {
  return sock.sendMessage(jid, { image: buffer, caption: caption || "" }, { quoted })
}

function tryParseJsonBuffer(buf) {
  try {
    const s = buf.toString("utf8").trim()
    if (!s.startsWith("{")) return null
    return JSON.parse(s)
  } catch {
    return null
  }
}

module.exports = {
  upload,
  uploadFromMessage,
  getBuffer,
  apiToBuffer,
  apiJsonToBuffer,
  sendImage,
  tryParseJsonBuffer
}