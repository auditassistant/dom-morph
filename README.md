dom-morph
===

Smoothly animate a DOM element swap from one to another. Great for in-place editors!

Uses [CSS transitions](https://github.com/mmckegg/css-transition) for the animation so currently will only work in modern browsers.

## Install

[![NPM](https://nodei.co/npm/dom-morph.png?compact=true)](https://nodei.co/npm/dom-morph/)

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
    document.getElementById('title').textContent = nameInput.value
    unmorph() // reverts to original element and removes new element
  }
  editor.appendChild(saveButton)

  var unmorph = morph(element, editor, 400, function(){
    console.log('morph complete')
  })
}
```

Run `npm run example` and navigate to `http://localhost:9966` to see it in action.