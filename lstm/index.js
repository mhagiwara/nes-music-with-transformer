import {music1, music2, music3, music4, music5} from './music-xformer';
import {music_mario} from './music-mario';

import {schedule, segment_music} from '/play';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggle1').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music1));
        Tone.Transport.toggle();
    });
    document.getElementById('toggle2').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music2));
        Tone.Transport.toggle();
    });
    document.getElementById('toggle3').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music3));
        Tone.Transport.toggle();
    });
    document.getElementById('toggle4').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music4));
        Tone.Transport.toggle();
    });
    document.getElementById('toggle5').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music5));
        Tone.Transport.toggle();
    });
    document.getElementById('toggle6').addEventListener('change', e => {
        Tone.Transport.cancel();
        schedule(segment_music(music_mario));
        Tone.Transport.toggle();
    });
});
