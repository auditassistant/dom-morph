var transition = require('css-transition')
var scrollBy = require('css-scroll-by')

module.exports = function(element, to, optionsOrTime, cb){
  // options: time, 

  if (!cb && typeof optionsOrTime == 'function'){
    cb = optionsOrTime
    optionsOrTime = null
  }

  var options = null

  if (typeof optionsOrTime === 'number'){
    options = {time: optionsOrTime}
  } else {
    options = optionsOrTime || {}
  }

  var scroll = getScroll()

  options.time = options.time || 400

  element.parentNode.appendChild(to)

  var match = getMatch(element, to)
  set(to, match.start)

  if (options.fit){
    scrollFit(match, options.time, getNumber(options.fit, 0))
  }

  transition(element, match.fromMatch, options.time)
  transition(to, match.end, options.time, function(){
    element.parentNode.insertBefore(to, element)
    set(to, match.target)
    set(element, match.original)
    element.style.display = 'none'
  })

  setScroll(scroll)

  return function unmorph (opts, cb){

    var scroll = getScroll()

    if (!cb && typeof opts === 'function'){
      cb = opts
      opts = null
    }
    opts = opts || options

    set(element, match.fromMatch)
    set(to, match.end)

    transition(element, match.original, opts.time)
    transition(to, match.start, opts.time, function(){
      var scroll = getScroll()
      to.parentNode.removeChild(to)
      set(to, match.target)
      setScroll(scroll)
    })

    setScroll(scroll) 

    if (opts.fit){
      scrollFit(match, opts.time, getNumber(opts.fit, 0), true)
    }
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

  var startRect = element.getBoundingClientRect()
  var endRect = to.getBoundingClientRect()

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
    original: original,
    startHeight: startRect.bottom - startRect.top,
    startWidth: startRect.right - startRect.left,
    endHeight: endRect.bottom - endRect.top,
    endWidth: endRect.right - endRect.left
  }
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

function getNumber(value, def){
  return typeof value === 'number' ? value : def
}

function scrollFit(match, time, cushion, reverse){
  var cushion = cushion || 0
  var view = {
    height: window.innerHeight || document.documentElement.clientHeight,
    width: window.innerWidth || document.documentElement.clientWidth,
    scrollX: document.documentElement.scrollLeft || document.body.scrollLeft,
    scrollY: document.documentElement.scrollTop || document.body.scrollTop 
  }

  var rect = reverse ? {
    top: parseInt(match.start['top']) - cushion,
    bottom: parseInt(match.start['top']) + match.startHeight + cushion,
    left: parseInt(match.start['left']) - cushion,
    right: parseInt(match.start['left']) + match.startWidth + cushion,
    width: match.startWidth,
    height: match.startHeight
  } : {
    top: parseInt(match.end['top']) - cushion,
    bottom: parseInt(match.end['top']) + match.endHeight + cushion,
    left: parseInt(match.end['left']) - cushion,
    right: parseInt(match.end['left']) + match.endWidth + cushion,
    width: match.endWidth,
    height: match.endHeight
  }

  var offset = [0,0]
  if (rect.left - view.scrollX < 0 || rect.width > view.width){
    offset[0] = rect.top - view.scrollX
  } else if (rect.right - view.scrollX > view.width){
    offset[0] = rect.right - view.scrollX - view.width
  }

  if (rect.top - view.scrollY < 0 || rect.height > view.height){
    offset[1] = rect.top - view.scrollY
  } else if (rect.bottom - view.scrollY > view.height){
    offset[1] = rect.bottom - view.scrollY - view.height
  }

  scrollBy(offset, time)
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