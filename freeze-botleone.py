import random
import os
import re
import json
from freeze_import import freeze_import_LMF


def flatten(a: list):
    import functools
    import operator
    return functools.reduce(operator.iconcat, a, [])


raw = freeze_import_LMF()
dataset = raw.split("\n")

model = {}
for line in dataset:
    line = line.lower().split(" ")

    for i, word in enumerate(line):
        word = word.strip()
        if len(word) == 0:
            continue

        if i == len(line) - 1:
            model['END'] = model.get('END', []) + [word]
        else:
            if i == 0:
                model['START'] = model.get('START', []) + [word]
            model[word] = model.get(word, []) + [line[i + 1]]


# Generate
def generate(model: dict):
    seeds = list(model.keys())
    seed = random.choice(seeds)
    # seed = random.choice(model['START'])

    generated = [seed]
    while True:
        last = generated[-1]
        if not last in model:
            break
        words = model[last]

        if len(words) < 3:
            k = 3 - len(words)
            words += random.choices(seeds, k=k)
        chosen = random.choice(words)
        generated.append(chosen)

        if chosen in model['END'] or len(generated) > 10:
            break

    return generated


# print("")
# print("\033[41;1mSortie :\033[m")
for i in range(5):
    segment = generate(model)
    length = len(segment)
    phrase = [segment]

    while length < 10:
        segment = generate(model)
        length += len(segment)
        phrase += [segment]

    s = ' '.join(flatten(phrase)).strip()
    print("• " + s)
