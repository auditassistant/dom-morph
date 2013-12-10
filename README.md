dom-morph
===

Smoothly animate a DOM element swap from one to another. Great for [in-place editors](https://github.com/mmckegg/former)!

Uses [CSS transitions](https://github.com/mmckegg/css-transition) for the animation so currently will only work in modern browsers.

[![NPM](https://nodei.co/npm/dom-morph.png?compact=true)](https://nodei.co/npm/dom-morph/)

## API

```js
var morph = require('dom-morph')
```

### morph(`from`, `to`, `optionsOrDuration`, `cb`)

Smoothly replace `from` element with `to` element. Returns `unmorph` function to reverts the change when called.

**`options`:**
- `duration`: in milliseconds how long the morph animation should take to complete
- `fit` (default `false`): When true, will scroll the window to ensure as much of the new element is visible. Specify a number to add a cushion of pixels around the edge of the element that also must be visible

`cb` will be called when animation completes.

### unmorph(`optionsOrDuration`, `cb`)

Returned by `morph`. Smoothly reverts back to original state.

### morph.after(`after`, `element`, `optionsOrDuration`, `cb`)

`element` is smoothly inserted after the element `after`. Returns `unmorph` function to revert.

### morph.remove(`element`, `optionsOrDuration`, `cb`)

`element` is smoothly removed from DOM. 

## Example

```html
<div id='page' style='padding:10px'>
  <header id='title'>Page Title</header>
  <div id='body'>Body content</div>
  <button onclick='edit()'>Edit</button>
</div>
```

```js
var morph = require('dom-morph')

window.edit = function(){
  var element = document.getElementById('page')

  var editor = document.createElement('div')
  editor.style.cssText = 'padding: 20px; background: silver; border: 1px solid gray'

  var nameInput = document.createElement('input')
  var bodyTextArea = document.createElement('textarea')
  editor.appendChild(nameInput)
  editor.appendChild(bodyTextArea)

  var saveButton = document.createElement('button')
  saveButton.textContent = 'Save'
  saveButton.onclick = function(){
    document.getElementById('title').textContent = nameInput.value
    document.getElementById('body').textContent = bodyTextArea.value
    unmorph() // reverts to original element and removes new element
  }
  editor.appendChild(saveButton)

  var unmorph = morph(element, editor, 400, function(){
    console.log('morph complete')
  })
}
```

### Run the example

```bash
$ npm install beefy -g
$ npm run example
```