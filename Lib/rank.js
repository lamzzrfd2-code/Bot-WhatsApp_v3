const fs = require('fs')

const dbFile = './database/rank.json'

if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

let rankDB = {}

try { rankDB = JSON.parse(fs.readFileSync(dbFile, 'utf-8')) } catch {}

// Simpan rankDB ke file

function saveRank() {

    fs.writeFileSync(dbFile, JSON.stringify(rankDB, null, 2))

}

// ===== TIERS =====

const tiers = [

    { name: 'Warrior', subs: ['III','II','I'], chatPerStar: 10 },

    { name: 'Elite', subs: ['III','II','I'], chatPerStar: 10 },

    { name: 'Master', subs: ['V','IV','III','II','I'], chatPerStar: 10 },

    { name: 'Grandmaster', subs: ['V','IV','III','II','I'], chatPerStar: 10 },

    { name: 'Epic', subs: ['V','IV','III','II','I'], chatPerStar: 10 },

    { name: 'Legend', subs: ['V','IV','III','II','I'], chatPerStar: 10 },

    { name: 'Mythic', subs: [], chatPerStar: 20 },

    { name: 'Mythic Honor', subs: [], chatPerStar: 20 },

    { name: 'Mythic Glory', subs: [], chatPerStar: 20 },

    { name: 'Imortal', subs: [], chatPerStar: 20 }

]

// ===== UPDATE RANK =====

function updateRank(groupId, userId, pushName) {

    if (!rankDB[groupId]) rankDB[groupId] = {}

    if (!rankDB[groupId][userId]) {

        rankDB[groupId][userId] = { 

            messages: 0, 

            tier: 'Warrior', 

            sub: 'III', 

           name: pushName,

            lastSeen: Date.now()

        }

    }

    const user = rankDB[groupId][userId]

    user.messages += 1

    user.name = pushName

    user.lastSeen = Date.now()

    // Hitung tier & sub

    let msg = user.messages

    let newTier = ''

    let newSub = ''

    for (let i = 0; i < tiers.length; i++) {

        const tier = tiers[i]

        const subCount = tier.subs.length

        const chatPerSub = tier.chatPerStar * 5

        if (subCount > 0) {

            const tierTotalChat = chatPerSub * subCount

            if (msg < tierTotalChat) {

                const subIndex = Math.floor((tierTotalChat - msg - 1) / chatPerSub)

                newTier = tier.name

                newSub = tier.subs[subIndex] || tier.subs[tier.subs.length - 1]

                break

            } else {

                msg -= tierTotalChat

            }

        } else {

            const star = Math.floor(msg / tier.chatPerStar) + 1

            newTier = tier.name

            newSub = `${star}*`

            break

        }

    }

    if (!newTier) {

        newTier = 'Imortal'

        newSub = `${Math.floor(msg / 20) + 1}*`

    }

    user.tier = newTier

    user.sub = newSub

    saveRank()

    return user

}

module.exports = { rankDB, saveRank, updateRank }