const fs = require('fs');
const path = './database/sider.json';

/**
 * Load semua data sider dari JSON
 */
function loadSider() {
    if (!fs.existsSync(path)) return {};
    try {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
    } catch {
        return {};
    }
}

/**
 * Simpan data sider ke JSON
 */
function saveSider(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

/**
 * Update last seen user per grup
 * @param {Object} m - message object
 */
function updateLastSeen(m) {
    if (!m.isGroup) return;

    const data = loadSider();
    const gid = m.chat;
    const uid = m.sender;

    data[gid] ??= {};
    data[gid][uid] = Date.now();

    saveSider(data);
}

/**
 * Ambil last seen user
 * @param {String} groupId 
 * @param {String} userId 
 * @returns {Number|null} timestamp last seen atau null
 */
function getLastSeen(groupId, userId) {
    const data = loadSider();
    return data[groupId]?.[userId] || null;
}

module.exports = { loadSider, saveSider, updateLastSeen, getLastSeen };
