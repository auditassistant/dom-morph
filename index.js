var transition = require('css-transition')

module.exports = function(element, to, time, cb){

  if (!cb && typeof time == 'function'){
    cb = time
    time = null
  }

  time = time || 400 

  element.parentNode.appendChild(to)

  var match = getMatch(element, to)
  set(to, match.start)

  transition(element, match.fromMatch, time)
  transition(to, match.end, time, function(){
    element.parentNode.insertBefore(to, element)
    set(element, match.original)
    element.style.display = 'none'
    set(to, match.target)
  })

  return function unmorph (cb){
    set(element, match.fromMatch)
    set(to, match.end)
    transition(element, match.original, time)
    transition(to, match.start, time, function(){
      to.parentNode.removeChild(to)
      set(to, match.target)
    })
  }

}


function getMatch(element, to){
  var fromStyle = window.getComputedStyle(element)
  var toStyle = window.getComputedStyle(to)

  var start = {}
  var end = {}
  var target = {} 
  var original = {}

  getStyleKeys().forEach(function(key){
    var root = /^.[a-z]*/.exec(key)[0]
    if (!(root in start) && root != 'webkit' && root != 'Moz' && fromStyle[key] != toStyle[key]){
      start[key] = fromStyle[key]
      end[key] = toStyle[key]
      target[key] = to.style[key]
      original[key] = element.style[key]
    }
  })

  fromMatch = mergeClone(end, {
    opacity: '0',
    display: fromStyle['display']
  })

  start['opacity'] = '0'
  end['opacity'] = '1'

  original['display'] = fromStyle['display']
  original['opacity'] = fromStyle['opacity']

  var fromPos = fromStyle['position']
  var toPos = toStyle['position']

  if ((fromPos == 'static' || fromPos == 'relative') && (toPos == 'static' || toPos == 'relative')){
    start['position'] = end['position'] = 'absolute'
    start['top'] = element.offsetTop + 'px'
    start['left'] = element.offsetLeft + 'px'
    start['width'] = fromStyle['width']
    start['height'] = fromStyle['height']
    start['margin'] = ''

    fromMatch['position'] = fromStyle['position']

    set(element, fromMatch)
    end['top'] = element.offsetTop - parsePx(toStyle['marginTop']) + 'px'
    end['left'] = element.offsetLeft - parsePx(toStyle['marginLeft']) + 'px'
    set(element, original)

    target['top'] = toStyle['top']
    target['left'] = toStyle['left']

    target['position'] = null
  }

  var autoHeight = getAutoHeight(element)
  if (fromStyle.height == autoHeight){
    original['height'] = 'auto'
  }

  var autoHeight = getAutoHeight(to)
  if (toStyle.height == autoHeight){
    to['height'] = 'auto'
  }

  return {
    start: start,
    end: end,
    fromMatch: fromMatch,
    target: target,
    original: original
  }
}

function set(element, attributes){
  Object.keys(attributes).forEach(function(key){
    element.style[key] = attributes[key]
  })
}

function getAutoHeight(element){
  var revert = element.style.height
  element.style.height = 'auto'
  var value = window.getComputedStyle(element).height
  element.style.height = revert
  return value
}

function parsePx(px){
  return parseInt(px, 10) || 0
}

function isNumeric(text){
  return /^[0-9]+$/.test(text)
}

var cachedStyleKeys = null
function getStyleKeys(){
  if (!cachedStyleKeys){
    var cachedStyleKeys = []
    var styles = window.getComputedStyle(document.body)
    for (var key in styles){
      if (key in styles && !isNumeric(key) && key != 'length' && key != 'cssText'){
        cachedStyleKeys.push(key)
      }
    }
  }
  return cachedStyleKeys
}

function mergeClone(){
  var result = {}
  for (var i=0;i<arguments.length;i++){
    var obj = arguments[i]
    if (obj){
      Object.keys(obj).forEach(function(key){
        result[key] = obj[key]
      })
    }
  }
  return result
}