# Introduction

This is a plugin showing new features of [Pengu Loader](https://github.com/PenguLoader/PenguLoader) with some examples

Incoming features:

- Plugin lifespan functions

- RCP hook integration

now available in [dev branch](https://github.com/PenguLoader/PenguLoader/commits/dev/core), and will be released in next stable version(v1.0.6 I guess) 

# Examples

You can find these in examples:

- Ember.js Component Hook

  Modify almost whole LCU if you want via custom Ember.js Mixin and wraps

  [More detailed introduction](./EMBER_COMPONENT_HOOK.md)

- BenchKiller

  Removes the bench swap cooldown in ARAM

- PartyCreated Hook

  Do whatever you want in a callback that triggers when create/join a party

- Audio player

  You can play your own audio file whenever you want

# Plugin lifespan functions

In next release, every plugin will have `three` lifespan function, they must be exported at top of a plugin(`index.js` usually)

```javascript
export function init(context) {
    // This function will be executed when V8 context created
    // At this point, LCU rcps are not loaded except `rcp-fe-common-libs`
    // you can add Hooks here
}
export function load() {
    // This should be where your old plugin entry moves to
    
    // This function will be executed when window is loaded
    // equivalent to window.addEventListener('load', YOUR_FUNCTION);
}
export default function your_function() {
    // This is a backup for load() function
    // so this won't be executed when load() is present
}
```

I Recommend you to use only the functions above to make your plugin entry clear

While you can still use old way to keep backward compatibility:

```javascript
// returns 1 if version1 < version2
function compareVersions(version1, version2) {
    const arr1 = version1.split('.').map(Number)
    const arr2 = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
        const num1 = arr1[i] || 0
        const num2 = arr2[i] || 0

        if (num1 < num2) {
            return 1
        } else if (num1 > num2) {
            return -1
        }
    }

    return 0
}

if (compareVersions(window.__llver, '1.0.6')) {
    // your old entry(adding eventlisteners...etc.)
}
// Do not write any other codes in top of your plugin(ES Module)
// unless you know what's going on
```

# RCP hook integration

This is just what [BakaFT/builtinPluginsHook](https://github.com/BakaFT/builtinPluginsHook/) do, but integrated inside PL with better design and more features.

Remember the `init` lifespan function mentioned above?

```javascript
export function init(context) {
    // There is a `context` argument
    // well you can change it to whatever you want, I think context is the currently best name
}
```

For now, `context` is only consist of `rcp`, who have three function member:

```javascript
export const rcp = {
    preInit,
    postInit,
    whenReady,
}
```

More details in [source code](https://github.com/PenguLoader/PenguLoader/blob/dev/plugins/src/preload/rcp/index.ts)

## preInit

You can use this function to register a callback that triggers **before** a specified RCP is about to load.

### Definition

```typescript
function preInit(name: string, callback: () => any) {
  if (typeof name === 'string' && typeof callback === 'function') {
    addHook(name, true, callback);
  }
}
```

### Usage

```javascript
export function load(context){
    context.rcp.preInit("rcp-fe-lol-parties",()=>{
        console.log("rcp-fe-lol-parties is going to be loaded ")
    })
}
```

## postInit

You can use this function to register a callback that triggers **after** a specified RCP is loaded.

This is often used to hook provided API of RCPs.

### Definition

```typescript
function postInit(name: string, callback: (api: any) => any) {
  if (typeof name === 'string' && typeof callback === 'function') {
    addHook(name, false, callback);
  }
}
```

### Usage

Here we hooked the `_partyCreated` function exported by `rcp-fe-lol-parties`

```javascript
// wrap_method is a function that replace function member of a Object with new one.
// You can find it in util.js
export function load(context){
    context.rcp.postInit("rcp-fe-lol-parties", (api) => {
        // This function is called everytime you create/join a party 
        wrap_method(api, "_partyCreated", function (original, args) {
            console.log("partyCreated hooked")
            // Do whatever you want
            return original(...args)
        })
    })
}
```

## whenReady

This returns one or several promises that resolves RCP APIs that you requested

### Definition

```typescript
function whenReady(name: string): Promise<any>;
function whenReady(names: string[]): Promise<any[]>;
function whenReady(param) {
  if (typeof param === 'string') {
    return new Promise<any>(resolve => {
      postInit(param, resolve);
    });
  } else if (Array.isArray(param)) {
    return Promise.all(param.map(name =>
      new Promise<any>(resolve => {
        postInit(name, resolve);
      })
    ));
  }
}
```

### Usage

```javascript
export function init(context) {
    context.rcp.whenReady('rcp-fe-lol-parties').then((api) => console.log(api))
}
export function init(context) {
    context.rcp.whenReady(['rcp-fe-lol-parties','rcp-fe-ember-libs']).then((apis) => console.log(apis))
}
```



