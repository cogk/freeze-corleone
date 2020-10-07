from collections import Counter
from freeze_import import freeze_import_LMF
import re

raw = freeze_import_LMF()
dataset = raw.lower().split("\n")

# Découpage des mots
re4 = re.compile(r'\s+')
all_words = re.split(re4, ' '.join(dataset))

stats = Counter(all_words)

is_terminal = False
if is_terminal:
    i = 0
    print(len(all_words))
    for (word, n) in reversed(stats.most_common(100)):
        i += 1
        s = word.ljust(24) + str(n)
        print(f'\x1b[3{i % 5 + 1}m' + s + '\x1b[m')
else:
    print('mot' + ',' + 'n')
    for (word, n) in stats.most_common(50):
        print(word + ',' + str(n))
