// This is safe because runTask() in these two components is only used to schedule swap cooldowns
// So just set the cooldown timeout to 0 to skip the bench swap cooldown in ARAM(And AURF too I think cuz it's using the same bench system)
const BENCH_KILLER = [
    {
        matcher: 'champion-bench',
        wraps: [
            {
                name: 'runTask',
                replacement: function (original, args) {
                    args[1] = 0
                    return original(...args)
                },
            },
        ],
    },
    {
        matcher: 'champion-bench-item',
        wraps: [
            {
                name: 'runTask',
                replacement: function (original, args) {
                    args[1] = 0
                    return original(...args)
                },
            },
        ],
    },
]

// the first one, the audio is played in `_startAnimations()`, where it calls `this.playSound()`, so we use warps to hook `this.playSound()`
// insted of overriding the whole `_startAnimations()` function, which is way too hard.
// the second one, I literally didn't find where the audio is played, but I found that these audio path are defined in `buttonSounds` property
// of the component, so just override `buttonSounds` property to change the audio path
const PARTY_AUDIO_REPLACEMENT = [
    {
        matcher: 'v2-lobby-root-component',
        wraps: [
            {
                name: 'playSound',
                replacement: function (original, args) {
                    if (
                        args[0] ===
                        '/fe/lol-parties/sfx-lobby-banner-intro-flare.ogg'
                    ) {
                        args[0] = '//plugins/pengu-rcp-hook-integration/assets/hello_adele.mp3'
                    }
                    return original(...args)
                },
            },
        ],
    },
    {
        matcher: 'game-select-footer-container',
        mixin: (Ember, args) => ({
            buttonSounds: {
                closeHover: '/fe/lol-parties/sfx-lobby-button-quit-hover.ogg',
                closeClick: '/fe/lol-parties/sfx-lobby-button-quit-click.ogg',
                confirmHover:
                    '//plugins/pengu-rcp-hook-integration/assets/cj_here_we_go_again.mp3',
                confirmClick:
                    '/fe/lol-parties/sfx-lobby-button-find-match-click.ogg',
            },
        }),
    },
]

// 
const CHAMP_SELECT_DODGE_LAST_SECOND = [
    {
        matcher: 'champion-select',
        mixin: (Ember, args) => ({
            didRender() {
                // Remember to keep what it was originally doing
                this._super(...arguments), this._endPerformanceMeasurement && this.debounceTask("_endPerformanceMeasurement", 250);
                // And do what we want to do after it
                if(this.get("session.timer.timeRemaining") == 1){
                    console.log("1 second left")
                    // dodge now
                }
            }
        })

    }
]

export const EMBER_COMPONENT_HOOKS = [
    ...BENCH_KILLER,
    ...PARTY_AUDIO_REPLACEMENT,
    ...CHAMP_SELECT_DODGE_LAST_SECOND
]
