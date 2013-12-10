var getStyleKeys = require('./get-style-keys')

module.exports = getMatch
module.exports.append = getMatchAppend
module.exports.remove = getMatchRemove

function getMatch(element, to){
  var fromStyle = window.getComputedStyle(element)
  var toStyle = window.getComputedStyle(to)

  var start = {}
  var end = {}
  var target = {} 
  var original = {}
  var fromMatch = {}

  getStyleKeys().forEach(function(key){
    var root = /^.[a-z]*/.exec(key)[0]
    if (!(root in start) && root != 'transition' && root != 'overflow' && root != 'webkit' && root != 'Moz' && fromStyle[key] != toStyle[key]){
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

  original['display'] = element.style['display']
  original['opacity'] = element.style['opacity']

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

  var startRect = element.getBoundingClientRect()
  var endRect = to.getBoundingClientRect()

  //var autoHeight = getAutoHeight(element)
  //if (original.height == autoHeight){
  //  original['height'] = 'auto'
  //}

  var autoHeight = getAutoHeight(to)
  if (toStyle.height == autoHeight){
    to['height'] = 'auto'
  }

  return {
    start: start,
    end: end,
    fromMatch: fromMatch,
    target: target,
    original: original,
    startHeight: startRect.bottom - startRect.top,
    startWidth: startRect.right - startRect.left,
    endHeight: endRect.bottom - endRect.top,
    endWidth: endRect.right - endRect.left
  }
}

function getMatchAppend(after, element){
  var toStyle = window.getComputedStyle(element)
  var aboveStyle = window.getComputedStyle(after)

  var rect = element.getBoundingClientRect()

  var start = {
    'height': '0px',
    'width': toStyle.width,
    'marginTop': -parsePx(aboveStyle.marginBottom) + 'px',
    'marginBottom': aboveStyle.marginBottom,
    'opacity': 0
  }

  if (toStyle.boxSizing !== 'border-box'){
    start['padding-bottom'] = start['padding-top'] = '0px'
    start['border-top-width'] = start['border-top-width'] = '0px'
  }

  var end = {
    top: element.offsetTop - parsePx(toStyle['marginTop']) + 'px',
    left: element.offsetLeft - parsePx(toStyle['marginLeft']) + 'px'
  }

  var target = {}
  Object.keys(start).forEach(function(key){
    end[key] = toStyle[key]
    target[key] = ''
  })

  start['top'] = element.offsetTop + 'px'
  start['left'] = element.offsetLeft + 'px'
  target['top'] = ''
  target['left'] = ''

  return {
    start: start,
    end: end,
    target: target,
    startHeight: 0,
    startWidth: rect.right - rect.left,
    endHeight: rect.bottom - rect.top,
    endWidth: rect.right - rect.left
  }
}

function getMatchRemove(element){

  var rect = element.getBoundingClientRect()

  var start = {
    top: element.offsetTop + 'px',
    left: element.offsetLeft + 'px'
  }

  var end = {
    top: element.offsetTop + 'px',
    left: element.offsetLeft + 'px',
    height: '0px',
    opacity: '0'
  }

  return {
    start: start,
    end: end,
    startHeight: rect.bottom - rect.top,
    startWidth: rect.right - rect.left,
    endHeight: 0,
    endWidth: rect.right - rect.left
  }
}

function parsePx(px){
  return parseInt(px, 10) || 0
}

function set(element, attributes){
  Object.keys(attributes).forEach(function(key){
    element.style[key] = attributes[key]
  })
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

function getAutoHeight(element){
  var revert = element.style.height
  element.style.height = 'auto'
  var value = window.getComputedStyle(element).height
  element.style.height = revert
  return value
}