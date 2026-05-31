// absen.js
const fs = require('fs')
const absendb = './database/absen.json'

function loadAbsen() {
  if (!fs.existsSync(absendb)) return {}
  try {
    return JSON.parse(fs.readFileSync(absendb, 'utf-8'))
  } catch {
    return {}
  }
}

function saveAbsen(data) {
  fs.writeFileSync(absendb, JSON.stringify(data, null, 2))
}

// WIB UTC+7 (aman group)
function getWIB() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const wib = new Date(utc + 7 * 3600000)
  return {
    date: wib.toISOString().split('T')[0],
    time: wib.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// ===== ABSEN =====
function doAbsen(groupId, userId, pushName) {
  const data = loadAbsen()
  const { date, time } = getWIB()

  if (!data[groupId]) data[groupId] = {}
  if (!data[groupId][date]) data[groupId][date] = {}

  const sudahPernah =
    Object.values(data[groupId]).some(day => day[userId])

  if (data[groupId][date][userId]) {
    return `❌ Kamu sudah absen hari ini`
  }

  data[groupId][date][userId] = {
    nama: pushName,
    time
  }

  saveAbsen(data)

  if (!sudahPernah) {
    return `✅ Absen berhasil atas nama ${pushName}\n*Pada:* ${time} WIB`
  } else {
    return `✅ Kamu berhasil absen\n*Pada:* ${time} WIB`
  }
}

// ===== LIST ABSEN =====
function listAbsen(groupId) {
  const data = loadAbsen()
  const { date } = getWIB()

  if (!data[groupId] || !data[groupId][date]) {
    return `Belum ada yang absen hari ini`
  }

  let teks = `*LIST ABSEN HARI INI*\n\n`
  const list = Object.values(data[groupId][date])

  list.forEach((u, i) => {
    teks += `${i + 1}. ${u.nama} (${u.time} WIB)\n`
  })

  return teks.trim()
}

module.exports = {
  doAbsen,
  listAbsen
}
