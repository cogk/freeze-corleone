/* eslint-env node */
const fs = require('fs')
const process = require('process')

const { basename } = require('path')
const { promisify } = require('util')

const reader = require('readline-sync')
reader.setDefaultOptions({
  print: () => {}
})

function annotate(json) {
  for (const song of json) {
    if (!Array.isArray(song.lyrics)) {
      song.lyrics = song.lyrics.split('\n')
    }

    if (song.lyrics.length > 1) {
      console.error()
      console.error()
      console.error('\x1b[33m[Antisémitisme Complotisme Racisme]\x1b[m')
      // acaB Drogue Gouvernement Insulte Sexe
      console.error('\x1b[33m[X pour passer la ligne et y revenir plus tard]\x1b[m')
      console.error()
      console.error('· \x1b[34;1;7m', song.title, '-', song.artist, '\x1b[m')

      for (const [k, lyric] of Object.entries(song.lyrics)) {
        const text = lyric.text ?? lyric
        const isLyric = !(text.startsWith('[') || text.length === 0)
        const isTagged = Array.isArray(lyric.tags)
        const toAnnotate = !isTagged && isLyric
        if (toAnnotate) {
          const input = reader.question('| \x1b[1m ' + text + ' \x1b[m ').trim()
          if (input.toLowerCase() === 'q') {
            return json
          }
          if (input.toLowerCase() === 'x') {
            continue
          }

          song.lyrics[k] = {
            text,
            tags: [...input.toUpperCase()].sort(),
          }
        } else {
          console.error('· \x1b[1m', text, isTagged ? '· \x1b[33m' + lyric.tags.join('') : '', '\x1b[m')
        }
      }
    }
  }
  return json
}

async function processFile(filename) {
  const readFile = promisify(fs.readFile)

  const data = await readFile(filename, 'utf8')
  const json = JSON.parse(data).filter(x => x.artist === 'Freeze Corleone')

  const annotated = annotate(json)
  console.log(JSON.stringify(annotated, null, 2))
}

if (process.argv.length === 3) {
  const filename = process.argv[2]
  processFile(filename)
} else {
  console.error(`usage: node ${basename(process.argv[1])} INPUT.json`)
}
