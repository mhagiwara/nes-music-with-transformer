function segment_music(music) {
    var frame = {};
    var segmented = [];
    for (var i = 0; i < music.length; i ++) {
        var word = music[i];
        if (word == 'lf') {
            segmented.push(frame);
            frame = {};
        } else {
            var parts = word.split(':');
            frame[parts[0]] = parts[1];
        }
    }

    return segmented;
};

function schedule(segmented) {
    var frame_in_seconds = 1.0 / 24;
    var synths = {
        'p1': new Tone.Synth({oscillator: {type: 'square'}}).toMaster(),
        'p2': new Tone.Synth({oscillator: {type: 'square'}}).toMaster(),
        'tr': new Tone.Synth({oscillator: {type: 'triangle'}}).toMaster(),
        'no': new Tone.NoiseSynth({
            noise : {
                type : 'white'
            } ,
            envelope : {
                attack : 0.0,
                decay : 1.0,
                sustain : 1,
                release: 0.001
            },
            volume: -5
        }).toMaster()
    }
    // part -> [note, lengths, position]
    var last_events = {
        'p1': undefined,
        'p2': undefined,
        'tr': undefined,
        'no': undefined
    };

    function _schedule_note(part, note, length, position) {
        if (part == 'no') {
            Tone.Transport.schedule(
                function (time) {
                    synths[part].triggerAttackRelease(
                        length * frame_in_seconds,    // length
                        time);    // position
                },
                position * frame_in_seconds
            );
        } else {
            Tone.Transport.schedule(
                function (time) {
                    synths[part].triggerAttackRelease(
                        note,
                        length * frame_in_seconds,    // length
                        time);    // position
                },
                position * frame_in_seconds
            );
        }
    };

    for (var i = 0; i < segmented.length; i ++) {
        var frame = segmented[i];
        ['p1', 'p2', 'tr', 'no'].forEach(function (part) {
            if (!(part in frame)) {
                if (last_events[part] != undefined) {
                    _schedule_note(part, last_events[part][0], last_events[part][1], last_events[part][2]);
                    last_events[part] = undefined;
                    return;
                }
            } else {
                if (last_events[part] != undefined) {
                    if (last_events[part][0] != frame[part]) {
                        _schedule_note(part, last_events[part][0], last_events[part][1], last_events[part][2]);
                        last_events[part] = [frame[part], 1, i];
                    } else {
                        last_events[part] = [frame[part], last_events[part][1] + 1, last_events[part][2]];
                    }
                } else {
                    last_events[part] = [frame[part], 1, i];
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('tone-play-toggle').addEventListener('change', e => Tone.Transport.toggle());
    schedule(segment_music(music));
});
