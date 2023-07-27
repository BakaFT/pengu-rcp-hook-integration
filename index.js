import {wrap_method, hookEmber} from './util'

export async function init(context) {
    let playSound

    context.rcp.postInit('rcp-fe-audio', api => {
        playSound = api.channels
            .get('sfx')
            .playSound.bind(api.channels.get('sfx'))
        // you can play audio manually(ogg,mp3 is supported as far as I know), and it seems doesn't matter which channel you use
        // playSound("//assets/hello.mp3")
    })

    context.rcp.postInit('rcp-fe-ember-libs', api => {
        // Almsot every part of LCU is an Ember component, and they are all created using Ember.Component.extend
        // So we hook Ember.Component.extend right after ember-libs initialized to apply our compoent hook
        wrap_method(api, 'getEmber', function (original, args) {
            const res = original(...args)
            return res.then(Ember => {
                hookEmber(Ember)
                return Ember
            })
        })
    })

    context.rcp.postInit('rcp-fe-lol-parties', api => {
        // This function is called everytime you create/join a party
        wrap_method(api, '_partyCreated', function (original, args) {
            console.log('partyCreated hooked')
            return original(...args)
        })
    })
}
