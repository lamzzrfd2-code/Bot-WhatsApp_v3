const fs = require('fs')

const path = require('path')

const { exec } = require('child_process')

const Crypto = require('crypto')

/**

 * Convert WebP buffer to PNG buffer using CLI ffmpeg

 * @param {Buffer} media - WebP sticker buffer

 * @returns {Promise<Buffer>} PNG buffer

 */

async function webpToImage(media) {

    return new Promise(async (resolve, reject) => {

        try {

            // file sementara

            const tmpFileIn = path.join(__dirname, `${Crypto.randomBytes(6).toString('hex')}.webp`)

            const tmpFileOut = path.join(__dirname, `${Crypto.randomBytes(6).toString('hex')}.png`)

            // simpan buffer ke disk

            await fs.promises.writeFile(tmpFileIn, media)

            // convert pakai ffmpeg CLI

            exec(`ffmpeg -y -i "${tmpFileIn}" "${tmpFileOut}"`, async (err) => {

                if (err) {

                    await fs.promises.unlink(tmpFileIn).catch(() => {})

                    return reject(err)

                }

                try {

                    const buffer = await fs.promises.readFile(tmpFileOut)

                    // hapus file sementara

                    await fs.promises.unlink(tmpFileIn).catch(() => {})

                    await fs.promises.unlink(tmpFileOut).catch(() => {})

                    resolve(buffer)

                } catch (e) {

                    reject(e)

                }

            })

        } catch (e) {

            reject(e)

        }

    })

}

module.exports = { webpToImage }