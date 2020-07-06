import * as fs from 'fs';

import * as argparse from 'argparse';

import {DataSet} from './dataset';
import {createModel, compileModel, fitModel, generateText} from './model';

function parseArgs() {
    const parser = argparse.ArgumentParser({
        description: 'Train an lstm-text-generation model.'
    });
    parser.addArgument('trainingPath', {
        type: 'string',
        help: 'Path to the training data'
    });
    parser.addArgument('validationPath', {
        type: 'string',
        help: 'Path to the validation data'
    });
    parser.addArgument('--gpu', {
        action: 'storeTrue',
        help: 'Use CUDA GPU for training.'
    });
    parser.addArgument('--sampleLen', {
        type: 'int',
        defaultValue: 60,
        help: 'Sample length: Length of each input sequence to the model, in ' +
        'number of characters.'
    });
    parser.addArgument('--sampleStep', {
        type: 'int',
        defaultValue: 3,
        help: 'Step length: how many characters to skip between one example ' +
        'extracted from the text data to the next.'
    });
    parser.addArgument('--learningRate', {
        type: 'float',
        defaultValue: 1e-2,
        help: 'Learning rate to be used during training'
    });
    parser.addArgument('--epochs', {
        type: 'int',
        defaultValue: 150,
        help: 'Number of training epochs'
    });
    parser.addArgument('--examplesPerEpoch', {
        type: 'int',
        defaultValue: 10000,
        help: 'Number of examples to sample from the text in each training epoch.'
    });
    parser.addArgument('--batchSize', {
        type: 'int',
        defaultValue: 128,
        help: 'Batch size for training.'
    });
    parser.addArgument('--displayLength', {
        type: 'int',
        defaultValue: 120,
        help: 'Length of the sampled text to display after each epoch of training.'
    });
    parser.addArgument('--savePath', {
        type: 'string',
        help: 'Path to which the model will be saved (optional)'
    });
    parser.addArgument('--lstmLayerSize', {
        type: 'string',
        defaultValue: '128,128',
        help: 'LSTM layer size. Can be a single number or an array of numbers ' +
        'separated by commas (E.g., "256", "256,128")'
    });
    return parser.parseArgs();
}

async function main() {
    const args = parseArgs();
    if (args.gpu) {
        console.log('Using GPU');
        require('@tensorflow/tfjs-node-gpu');
    } else {
        console.log('Using CPU');
        require('@tensorflow/tfjs-node');
    }

    const text = fs.readFileSync(args.trainingPath, {encoding: 'utf-8'});
    const words = text.toString().split('\n');
    const dataSet = new DataSet(words, args.sampleLen, args.sampleStep);
    
    const lstmLayerSize = args.lstmLayerSize.indexOf(',') === -1 ?
        Number.parseInt(args.lstmLayerSize) :
        args.lstmLayerSize.split(',').map(x => Number.parseInt(x));

    const model = createModel(
        dataSet.sampleLen(), dataSet.vocabularySize(), lstmLayerSize);
    compileModel(model, args.learningRate);

    // Get a seed text for display in the course of model training.
    const [seed, seedIndices] = dataSet.getRandomSlice();
    console.log(`Seed text:\n"${seed}"\n`);

    const DISPLAY_TEMPERATURES = [0, 0.25, 0.5, 0.75];
    let epochCount = 0;
    await fitModel(
        model, dataSet, args.epochs, args.examplesPerEpoch, args.batchSize,
        args.validationSplit, {
            onTrainBegin: async () => {
                epochCount++;
                console.log(`Epoch ${epochCount} of ${args.epochs}:`);
            },
            onTrainEnd: async () => {
                DISPLAY_TEMPERATURES.forEach(async temperature => {
                    const generated = await generateText(
                        model, dataSet, seedIndices, args.displayLength, temperature);
                    console.log(
                        `Generated text (temperature=${temperature}):\n` +
                        `"${generated}"\n`);
                });
            }
        });
                
    if (args.savePath != null && args.savePath.length > 0) {
        await model.save(`file://${args.savePath}`);
        fs.writeFileSync(`${args.savePath}/vocab.json`, JSON.stringify(dataSet.vocabulary_));
        console.log(`Saved model to ${args.savePath}`);
    }
}

main();
