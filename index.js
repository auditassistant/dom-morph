var transition = require('css-transition')
var getMatch = require('./lib/get-match')
var scrollFit = require('./lib/scroll-fit')

module.exports = function(element, to, optionsOrDuration, cb){
  // options: duration, 

  if (!cb && typeof optionsOrDuration == 'function'){
    cb = optionsOrDuration
    optionsOrDuration = null
  }

  var options = typeof optionsOrDuration === 'number' ? 
    {duration: optionsOrDuration} : optionsOrDuration || {}

  options.duration = options.duration || 400


  var scroll = getScroll()

  if (!to.parentNode){
    element.parentNode.appendChild(to)
  }

  var match = getMatch(element, to)
  set(to, match.start)

  transition(element, match.fromMatch, options.duration)
  transition(to, match.end, options.duration, function(){
    var selection = getSelection()
    element.parentNode.insertBefore(to, element)
    set(to, match.target)
    set(element, match.original)
    element.style.display = 'none'
    setSelection(selection)
    cb&&cb()
  })

  setScroll(scroll)

  if (options.fit){
    scrollFit(match, options.duration, getNumber(options.fit, 0))
  }


  return function unmorph (opts, cb){

    var scroll = getScroll()

    if (!cb && typeof opts === 'function'){
      cb = opts
      opts = null
    }
    opts = opts || options
    opts.duration = opts.duration || 400

    set(element, match.fromMatch)
    set(to, match.end)

    transition(element, match.original, opts.duration)
    transition(to, match.start, opts.duration, function(){
      var scroll = getScroll()
      to.parentNode.removeChild(to)
      set(to, match.target)
      setScroll(scroll)
      cb&&cb()
    })

    setScroll(scroll) 

    if (opts.fit){
      scrollFit(match, opts.duration, getNumber(opts.fit, 0), true)
    }
  }

}

module.exports.after = function(after, element, optionsOrDuration, cb){

  if (!cb && typeof optionsOrDuration == 'function'){
    cb = optionsOrDuration
    optionsOrDuration = null
  }

  var options = typeof optionsOrDuration === 'number' ? 
    {duration: optionsOrDuration} : optionsOrDuration || {}
  
  options.duration = options.duration || 400

  var scroll = getScroll()

  insertAfter(element, after)
  var match = getMatch.append(after, element)

  set(element, match.start)
  transition(element, match.end, options.duration, function(){
    set(element, match.target)
    cb&&cb()
  })

  setScroll(scroll)

  if (options.fit){
    scrollFit(match, options.duration, getNumber(options.fit, 0))
  }

  return function unmorph(opts, cb){

    if (!cb && typeof opts === 'function'){
      cb = opts
      opts = null
    }
    opts = opts || options
    opts.duration = opts.duration || 400

    var scroll = getScroll()

    transition(element, match.start, opts.duration, function(){
      element.parentNode.removeChild(element)
      cb&&cb()
    })

    setScroll(scroll)

    if (opts.fit){
      scrollFit(match, opts.duration, getNumber(opts.fit, 0), true)
    }
  }

}

module.exports.remove = function(element, optionsOrDuration, cb){
  if (!cb && typeof optionsOrDuration == 'function'){
    cb = optionsOrDuration
    optionsOrDuration = null
  }

  var options = typeof optionsOrDuration === 'number' ? 
    {duration: optionsOrDuration} : optionsOrDuration || {}
  
  options.duration = options.duration || 400

  var scroll = getScroll()
  var match = getMatch.remove(element)

  transition(element, match.end, options.duration, function(){
    element.parentNode.removeChild(element)
    cb&&cb()
  })

  setScroll(scroll)

  if (options.fit){
    scrollFit(match, options.duration, getNumber(options.fit, 0))
  }

}

function getNumber(value, def){
  return typeof value === 'number' ? value : def
}

function insertAfter(node, after){
  if (after.nextSibling){
    after.parentNode.insertBefore(node, after.nextSibling)
  } else {
    after.parentNode.appendChild(node)
  }
}

function setScroll(scroll){
  document.body.scrollLeft = scroll[0]
  document.documentElement.scrollLeft = scroll[0]
  document.body.scrollTop = scroll[1]
  document.documentElement.scrollTop = scroll[1]
}

function getScroll(){
  return [   
    document.documentElement.scrollLeft || document.body.scrollLeft,
    document.documentElement.scrollTop || document.body.scrollTop
  ]
}

function getSelection(){
  if (document.activeElement){
    var element = document.activeElement
    return {
      element: element,
      selectionStart: element.selectionStart,
      selectionEnd: element.selectionEnd,
      selectionDirection: element.selectionDirection,
    }
  }
}

function setSelection(selection){
  if (selection && selection.element != document.activeElement && selection.element.focus){
    selection.element.focus()
    selection.element.selectionStart = selection.selectionStart
    selection.element.selectionEnd = selection.selectionEnd
    selection.element.selectionDirection = selection.selectionDirection
  }
}

function set(element, attributes){
  Object.keys(attributes).forEach(function(key){
    element.style[key] = attributes[key]
  })
}