import {EMBER_COMPONENT_HOOKS} from './ember_hooks.js'

const WRAPPED = Symbol('WRAPPED')
export function wrap_method(container, name, replacement) {
    if (!container || typeof container[name] !== 'function') return
    if (container[name][WRAPPED]) return
    const old = container[name]
    container[name] = function (...args) {
        return replacement.call(this, (...a) => old && old.apply(this, a), args)
    }
    container[name][WRAPPED] = true
}

export const hookEmber = Ember => {
    // Apply our mixins and wraps to Ember.Component.extend
    wrap_method(Ember.Component, 'extend', function (original, args) {
        let res = original(...args)
        const name = args
            .filter(
                x =>
                    typeof x === 'object' &&
                    x.classNames &&
                    Array.isArray(x.classNames),
            )
            .map(x => x.classNames.join(' '))
        if (name.length) {
            EMBER_COMPONENT_HOOKS.filter(x => x.matcher === name[0]).forEach(
                hook => {
                    const Mixin = hook.mixin
                    if (typeof Mixin === 'function') {
                        res = res.extend(Mixin(Ember, args))
                    }
                    if (hook.wraps && hook.wraps.length > 0) {
                        hook.wraps.forEach(wrap => {
                            wrap_method(
                                res.proto(),
                                wrap.name,
                                wrap.replacement,
                            )
                        })
                    }
                },
            )
        }
        return res
    })
}
