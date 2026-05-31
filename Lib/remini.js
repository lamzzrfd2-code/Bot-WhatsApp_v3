// lib/remini.js
"use strict"

const axios = require("axios")

/**
 * Enhance image (HD/Remini) via yupra API
 * @param {string} imageUrl - public image url
 * @param {number} scale - default 8 (allowed: 2..8)
 * @returns {Promise<{ imageUrl: string, downloadUrl: string, scale: string, info: string }>}
 */
async function enhance(imageUrl, scale = 8) {
  if (!imageUrl) throw new Error("IMAGE_URL_REQUIRED")

  let sc = parseInt(scale)
  if (isNaN(sc)) sc = 8
  if (sc < 2) sc = 2
  if (sc > 8) sc = 8

  const api = `https://api.yupra.my.id/api/tools/hd?url=${encodeURIComponent(imageUrl)}&scale=${sc}`

  const { data } = await axios.get(api, { timeout: 120_000 })
  if (!data || data.status !== 200) throw new Error("REMNI_API_FAILED")

  const result = data.result || {}
  if (!result.downloadUrl && !result.imageUrl) throw new Error("REMNI_NO_OUTPUT")

  return {
    imageUrl: result.imageUrl || result.downloadUrl,
    downloadUrl: result.downloadUrl || result.imageUrl,
    scale: result.scale || `${sc}x`,
    info: result.info || data.content || "Success"
  }
}

module.exports = { enhance }