import sys
import glob
import pickle


def note2name(note):
    names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = note / 12 - 1
    return '%s%s' % (names[note % 12], octave)


def seprsco2textsco(seprsco):
    # convert separated score to text score
    text = []
    for t in xrange(seprsco.shape[0]):
        if seprsco[t, 0] > 0:
            text.append('p1:%s' % note2name(seprsco[t, 0]))

        if seprsco[t, 1] > 0:
            text.append('p2:%s' % note2name(seprsco[t, 1]))

        if seprsco[t, 2] > 0:
            text.append('tr:%s' % note2name(seprsco[t, 2]))

        if seprsco[t, 3] > 0:
            text.append('no:%s' % note2name(seprsco[t, 3]))

        text.append('lf')
    return text


def main():
    splits = ['train', 'valid', 'test']

    for split in splits:
        for filepath in glob.glob('data/nesmdb24_seprsco/%s/*' % split):
            sys.stderr.write('Converting %s ...\n' % filepath)
            filename = filepath.split('/')[-1]
            with open(filepath, 'rb') as f:
                rate, nsamps, seprsco = pickle.load(f)
            text = seprsco2textsco(seprsco)

            target_filename = filename[:-4] + '.txt'
            with open('data/nesmdb24_textsco/%s/%s' % (split, target_filename), 'w') as f:
                for word in text:
                    f.write(word)
                    f.write('\n')


if __name__ == '__main__':
    main()
