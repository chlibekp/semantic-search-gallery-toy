import TextModel from "./ai/textModel";
import VisionModel from "./ai/visionModel";

let running = true;

while(running) {

}

function shutdown() {
    running = false;
    
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);