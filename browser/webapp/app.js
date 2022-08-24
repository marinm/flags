import {config} from './config.js';
import {FlagsBoard} from './flags-board.js';

// Set up clickable canvas tiles
FlagsBoard({
    ...config,
    canvasElement: document.querySelector('#game-canvas')
});