import * as fs from 'fs';
import * as axios from 'axios';
import * as tf from '@tensorflow/tfjs';

import {DataSet} from './dataset';
import {generateText} from './model';

import {schedule, segment_music} from '/play';

function log(text) {
    document.getElementById('log').innerHTML += text;
}

async function run() {
    log('Loading model and vocabulary ...');
    const model = await tf.loadLayersModel('model/model.json');
    const response = await axios.get('model/vocab.json');
    const vocab = await response.data;

    const sampleLen = model.inputs[0].shape[1];
    const textData = new DataSet([], sampleLen, 0);
    textData.vocabulary_ = vocab;
    const prefix = ['p1:G5', 'p2:E5', 'tr:C4', 'no:C0', 'lf'];
    const prefixIndices = [];
    for (let i in prefix) {
        prefixIndices.push(vocab.indexOf(prefix[i]));
    }
    log('Prefix: ' + prefixIndices);
    log('Generating...');

    function _log_generation(char) {
        log('Generated: ' + char);
    }

    generateText(model, textData, prefixIndices, 200, 1.0, _log_generation).then(
        generated => {
            schedule(segment_music(generated));
        }
    );
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('tone-play-toggle').addEventListener('change', e => Tone.Transport.toggle());
    run();
});
