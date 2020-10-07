/* eslint-env node */
const fs = require('fs')
const process = require('process')

const got = require('got')
const { Window } = require('happy-dom')
const { basename } = require('path')
const { promisify } = require('util')

function removeHtmlEntities(str) {
  return str
    .replace(/&#x([\da-f]+);/g, (match, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function getLyricsFromDom(body) {
  const lyricsEls = [...body.querySelectorAll('.Lyrics__Container-sc-1ynbvzw-2')]
  lyricsEls.forEach(x => x.innerHTML = x.innerHTML.replace(/<br\s*\/?>/g, '\n'))
  if (lyricsEls.length) {
    const lyrics = lyricsEls
      .map(x => x.innerText)
    // .map(x => x.innerText.trim())
    // .join('\n')
    // .split(/\r|\n/)
    // .filter(s => s.length > 0 && !s.startsWith('['))
    // .filter(s => s.length > 0)
    // .map(text => ({ text, tags: [] }))
      .map(removeHtmlEntities)
      .join('\n')
    return lyrics
  }
}

function getMetaFromDom(body) {
  const album = body.querySelector('.HeaderTracklist__Album-sc-1qmk74v-3')?.innerText?.trim() ?? undefined
  const title = body.querySelector('.SongHeader__Title-sc-1b7aqpg-7')?.innerText?.trim() ?? undefined
  const artist = body.querySelector('.SongHeader__Artist-sc-1b7aqpg-8')?.innerText?.trim() ?? undefined
  return Object.fromEntries(Object.entries({ album, title, artist }).filter(([,v]) => v !== undefined))
}

async function getSongObjectFromUrl(url) {
  const res = await got(url)

  const win = new Window()
  win.document.body.innerHTML = res.body
  const lyrics = getLyricsFromDom(win.document.body)
  const meta = getMetaFromDom(win.document.body)
  return { lyrics, ...meta }
}

async function getAnnotatedSong(song) {
  if (song.lyrics && song.lyrics.length > 0) {
    console.error(song.title, '\x1b[32mskipped\x1b[m')
    return Promise.resolve(song)
  } else {
    const updatedSong = await getSongObjectFromUrl(song.href)
    console.error(song.title, updatedSong.lyrics ? updatedSong.lyrics.length : '-')
    return { ...song, ...updatedSong }
  }
}

async function annotateGeniusJson(genius) {
  return Promise.all(genius.map(getAnnotatedSong))
}

async function processFile(filename) {
  const readFile = promisify(fs.readFile)

  const data = await readFile(filename, 'utf8')
  const json = JSON.parse(data).filter(song => song.artist === 'Freeze Corleone')
  const annotated = await annotateGeniusJson(json)

  console.error('Filtered:  ', annotated.length, '/', json.length)
  console.error('Successful:', annotated.filter(x => x.lyrics).length, '/', json.length)
  console.log(JSON.stringify(annotated, null, 2))
}

if (process.argv.length === 3) {
  const filename = process.argv[2]
  processFile(filename)
} else {
  console.error(`usage: node ${basename(process.argv[1])} INPUT`)
}
