import * as tf from '@tensorflow/tfjs';

export class DataSet {
    constructor(tokens, sampleLen, sampleStep) {
        this.tokens_ = tokens;
        this.length_ = tokens.length;
        this.sampleLen_ = sampleLen;
        this.sampleStep_ = sampleStep;

        this.getVocabulary_();
        this.convertAllTokensToIndices_();
    }

    sampleLen() {
        return this.sampleLen_;
    }

    vocabularySize() {
        return this.vocabularySize_;
    }
    
    nextDataEpoch(numExamples) {
        this.generateExampleBeginIndices_();
        
        if (numExamples == null) {
            numExamples = this.exampleBeginIndices_.length;
        }
        
        const xsBuffer = new tf.TensorBuffer([
            numExamples, this.sampleLen_, this.vocabularySize_]);
        const ysBuffer  = new tf.TensorBuffer([numExamples, this.vocabularySize_]);
        for (let i = 0; i < numExamples; ++i) {
            const beginIndex = this.exampleBeginIndices_[
                this.examplePosition_ % this.exampleBeginIndices_.length];
            for (let j = 0; j < this.sampleLen_; ++j) {
                xsBuffer.set(1, i, j, this.indices_[beginIndex + j]);
            }
            ysBuffer.set(1, i, this.indices_[beginIndex + this.sampleLen_]);
            this.examplePosition_++;
        }
        return [xsBuffer.toTensor(), ysBuffer.toTensor()];
    }

    getFromVocabulary(index) {
        return this.vocabulary_[index];
    }

    tokensToIndices(tokens) {
        const indices = [];
        for (let i = 0; i < tokens.length; ++i) {
            indices.push(this.vocabulary_.indexOf(tokens[i]));
        }
        return indices;
    }
    
    getRandomSlice() {
        const startIndex =
            Math.round(Math.random() * (this.length_ - this.sampleLen_ - 1));
        const randomSlice = this.slice_(startIndex, startIndex + this.sampleLen_);
        return [randomSlice, this.tokensToIndices(randomSlice)];
    }

    slice_(startIndex, endIndex) {
        return this.tokens_.slice(startIndex, endIndex);
    }

    getVocabulary_() {
        this.vocabulary_ = [];
        for (let i = 0; i < this.length_; ++i) {
            if (this.vocabulary_.indexOf(this.tokens_[i]) === -1) {
                this.vocabulary_.push(this.tokens_[i]);
            }
        }
        this.vocabularySize_ = this.vocabulary_.length;
    }
    
    convertAllTokensToIndices_() {
        this.indices_ = new Uint16Array(this.tokensToIndices(this.tokens_));
    }

    generateExampleBeginIndices_() {
        // Prepare beginning indices of examples.
        this.exampleBeginIndices_ = [];
        for (let i = 0;
            i < this.length_ - this.sampleLen_ - 1;
            i += this.sampleStep_) {
            this.exampleBeginIndices_.push(i);
        }
    
        // Randomly shuffle the beginning indices.
        tf.util.shuffle(this.exampleBeginIndices_);
        this.examplePosition_ = 0;
    }
}
