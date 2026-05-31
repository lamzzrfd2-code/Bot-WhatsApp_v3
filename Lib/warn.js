// warn.js
const fs = require('fs')
const warndb = './database/warn.json'

function loadWarn() {
  if (!fs.existsSync(warndb)) return {}
  try {
    return JSON.parse(fs.readFileSync(warndb, 'utf-8'))
  } catch {
    return {}
  }
}

function saveWarn(data) {
  fs.writeFileSync(warndb, JSON.stringify(data, null, 2))
}

function addWarn(groupId, userId) {
  const data = loadWarn()
  if (!data[groupId]) data[groupId] = {}
  if (!data[groupId][userId]) data[groupId][userId] = 0

  data[groupId][userId] += 1
  saveWarn(data)

  return data[groupId][userId]
}

function removeWarn(groupId, userId) {
  const data = loadWarn()
  if (!data[groupId] || !data[groupId][userId]) return 0

  data[groupId][userId] -= 1
  if (data[groupId][userId] <= 0) delete data[groupId][userId]

  saveWarn(data)
  return data[groupId]?.[userId] || 0
}

function getWarn(groupId, userId) {
  const data = loadWarn()
  return data[groupId]?.[userId] || 0
}

function listWarn(groupId) {
  const data = loadWarn()
  return data[groupId] || {}
}

function resetWarn(groupId, userId) {
  const data = loadWarn()
  if (data[groupId]) delete data[groupId][userId]
  saveWarn(data)
}

module.exports = {
  addWarn,
  removeWarn,
  getWarn,
  listWarn,
  resetWarn
}
