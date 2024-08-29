import { pipeline, env } from "@xenova/transformers";
import { MessageTypes } from "./presets.js";

// Disable local models: otherwise we get error
env.allowLocalModels = false;
env.useBrowserCache = false;

// Define transcription pipeline
class MyTranscriptionPipeline {
    // Singleton implementation
    static task = 'automatic-speech-recognition'
    static model = 'Xenova/whisper-tiny.en'

    // Instantiation mechanism
    static instance = null
    static async getInstance(progress_callback=null) {
        if (this.instance === null){
            this.instance = await pipeline(this.task, this.model, {progress_callback})
        }
        return this.instance
    }
}

async function loading_callback(data){
    self.postMessage(data)
}

function createPartialResultMessage(result){
    self.postMessage(
        {
            status:"PARTIAL",
            type:MessageTypes.RESULT_PARTIAL,
            result
        }
    )
}

function createResultMessage(result){
    self.postMessage(
        {
            status:"CHUNK",
            type:MessageTypes.RESULT,
            result
        }
    )
}

function sendLoadingMessage(status){
    self.postMessage({
            status,
            type:MessageTypes.LOADING
        })
}

class GenerationTracker {
    constructor(pipeline, stride_length_s){
        this.pipeline = pipeline
        this.stride_length_s = stride_length_s
        this.chunks = []
        // the precision with which the model will analyse the data
        this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions;
    }

    sendFinalResult(){
        self.postMessage({
            status:'FINISHED',
            type: MessageTypes.INFERENCE_DONE
        })
    }

     // this function is called whenever a new token is predicted by the model, the full text string for the chunk is given (undecoded)
    callbackFunction(beams) {
        const bestBeam = beams[0]
        // decode the returned token, we always get a single result but it is returned in an array
        let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true
        })
    
        const result = {
            text
        }
        // send the partial results message to the App
        createPartialResultMessage(result)
    }

    // this is called with each completed chunk, it includes the finished tokens for the whole chunk at once, instead of 1 token at a time like above
    chunkCallback(data) {
        this.chunks.push(data)
        try {
            // we call a more specific asr (automatic speech recognition) decoder for the chunk
            const decoded_chunk = this.pipeline.tokenizer._decode_asr(
                this.chunks, {
                    // the time precision with which to analyse the audio file
                    time_precision: this.time_precision,
                }
            )
            // trim the decoded text, and place in results object,
            const text = decoded_chunk[0].trim()
            const result = {
                text
            }
            // send the results message to the App
            createResultMessage(
                result, false
            )

        } catch (error) {
            console.warn(`Error in ChunkCallback: \n${error.message}`);
        }
    }
}

async function transcribe(audio) {
    sendLoadingMessage('LOADING')

    let pipeline
    try {
        pipeline = await MyTranscriptionPipeline.getInstance(loading_callback)
        console.log("Got pipeline")
    } catch (err) {
        console.log(`Error in Transcription: ${err.message}`)
        console.log(err)
    }

    sendLoadingMessage('LOADED')

    // Set stride length (left and right to each chunk, to get more context during inference)
    // https://huggingface.co/docs/transformers/main_classes/pipelines
    const stride_length_s = 0
    // Create generation tracker sending partial and end results
    const generationTracker = new GenerationTracker(pipeline, stride_length_s)

    // Start pipeline
   /* let url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
    let test = await pipeline(url)
*/

    let test = await pipeline(audio, {
        // we do not want to use top_k encoding, or any sampling encoding
        top_k: 0,
        do_sample: false,
        // we want to split long audio into many smaller chunks
        chunk_length_s: 30,
        // overlap at edge of each chunk, defined above
        stride_length_s,
        // we want timestamps on our transcribed audio
        return_timestamps: true,
        // this function is called for each token generated
        callback_function: generationTracker.callbackFunction.bind(generationTracker), // to really call the method specific to generationTracker
        // this callback function will be called after each chunk is processed
        chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
    })

    // Send final results from the generation tracker
    generationTracker.sendFinalResult()

}


// Add event listener for the worker
self.addEventListener('message', async (e) => {
    const {type, audio} = e.data
    if (type === MessageTypes.INFERENCE_REQUEST){
        await transcribe(audio)
    }
})