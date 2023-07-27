# Introduction

**EVERYTHING BELOW IS DEFINED BY ME, NOT PENGU LOADER**

To hook ember.js component, there are two ways:

- Mixin

  This is a Ember.js feature, every thing in Ember.js is created by Extending, and Mixin is one way to "Extend" a object. So define a Mixin you can `add/override` any properties or methods of a component

- Wraps

  Simple function member replacement using `wrap_method`, used to hook a `created component`

# Structure of a Hook

A typical hook should be like:

```javascript
const PARTY_AUDIO_REPLACEMENT = [
    // The first one is to replace the sound when someone get into party
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
                        args[0] = '//plugins/my-plugin/assets/hello_adele.mp3'
                    }
                    return original(...args)
                },
            },
        ],
    },
    // The second one is to change the sound when you hover onto confirm button in mode select UI
    // where you click it and you get into the party
    {
        matcher: 'game-select-footer-container',
        mixin: (Ember, args) => ({
            buttonSounds: {
                closeHover: '/fe/lol-parties/sfx-lobby-button-quit-hover.ogg',
                closeClick: '/fe/lol-parties/sfx-lobby-button-quit-click.ogg',
                confirmHover:
                    '//plugins/my-plugin/assets/cj_here_we_go_again.mp3',
                confirmClick:
                    '/fe/lol-parties/sfx-lobby-button-find-match-click.ogg',
            },
        }),
    },
]
```

`mixin` and `wraps` are **optional** depends on what you do

- `matcher` is the name of the component, you can find it in the source code of RCPs by searching `classNames`
- `mixin` is a Ember.js Mixin(A function that returns an object literal). Mixin is used to add/override properties  or methods of a component.
- `wraps` is a list of hooks, used to hook methods of a component.

# Difference between Mixin and Wraps

They are different. 

## Mixin

`mixin` is to totally override a member of component.

That's to say, if you are overriding a `method`, you have to define everything that a function has including:

- Arguments
- Internal logic
- Return value

If you are overriding a `property`, you have to keep everything still except things you change, just like the second hook example in last section. (Or you can  use some more elegant way to do that in Ember.js, let me know if you do, thx)

## Wraps

`wraps`is to hook a `function` of a component, you can:

- Change the arguments of it
- Get the return value of it
- And do anything you want before/after this function executes

