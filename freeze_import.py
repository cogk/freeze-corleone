import re
import json


def freeze_import_LMF():
    return freeze_import(lambda song: 'album' in song and song['album'] == 'LMF')


def freeze_import(*filters, annotations=False, punctuation=False):
    # Lecture du fichier
    f = open('data/freeze-corleone-lyrics.json', 'r', encoding='utf8')
    songs = json.loads(f.read())

    # Filtrage
    for f in filters:
        songs = filter(f, songs)

    # Texte brut
    lyrics = map(lambda s: s['lyrics'], songs)
    raw = '\n'.join(lyrics)

    # Suppression des multiplicateurs (e.g. "[Refrain] x3")
    if not annotations:
        re1 = re.compile(r'\] [x×]\d+', re.IGNORECASE)
        raw = re.sub(re1, ']', raw)

        # On filtre les lignes vides ou les lignes de commentaire comme « [Refrain] »
        lines = raw.split('\n')
        lines = filter(lambda s: len(s) > 0 and s[0] != '[', lines)
        raw = '\n'.join(lines)

    # Suppression de la ponctuation
    if not punctuation:
        re2 = re.compile(r'[,.?!:;"\[\]()]', re.IGNORECASE)
        raw = re.sub(re2, '', raw)

    # Normalisation des apostrophes
    re3 = re.compile(r'[‘’’]', re.IGNORECASE)
    raw = re.sub(re3, '\'', raw)

    # Normalisation des élisions [WIP]
    # re4 = re.compile(r'(qu|j|d|l)\'')
    # raw = re.sub(re4, r'\1e ', raw)
    # re5 = re.compile(r'(t)\'')
    # raw = re.sub(re5, 'tu ', raw)

    # Suppression des espaces blancs superflus
    re6 = re.compile(r'[^\S\r\n]+')
    raw = re.sub(re6, ' ', raw)

    # from collections import Counter
    # for (m, n) in Counter(list(raw)).most_common():
    #     print(m, n)
    # exit()
    return raw
