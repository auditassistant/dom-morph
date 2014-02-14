var scrollBy = require('css-scroll-by')

var offset = [0, 0]
var lastDuration = null

module.exports = function(match, duration, cushion, reverse){
  var cushion = cushion || 0
  var view = {
    height: window.innerHeight || document.documentElement.clientHeight,
    width: window.innerWidth || document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollX: document.documentElement.scrollLeft || document.body.scrollLeft,
    scrollY: document.documentElement.scrollTop || document.body.scrollTop 
  }

  var rect = reverse ? {
    top: parseInt(match.start['top']) - cushion,
    bottom: parseInt(match.start['top']) + match.startHeight + cushion,
    left: parseInt(match.start['left']) - cushion,
    right: parseInt(match.start['left']) + match.startWidth + cushion,
    width: match.startWidth,
    height: match.startHeight,
    differenceX: match.startWidth - match.endWidth,
    differenceY: match.startHeight - match.endHeight
  } : {
    top: parseInt(match.end['top']) - cushion,
    bottom: parseInt(match.end['top']) + match.endHeight + cushion,
    left: parseInt(match.end['left']) - cushion,
    right: parseInt(match.end['left']) + match.endWidth + cushion,
    width: match.endWidth,
    height: match.endHeight,
    differenceX: match.endWidth - match.startWidth,
    differenceY: match.endHeight - match.startHeight
  }

  setAbsoluteOffset(rect, match.offsetParent)

  if (rect.fixed){
    return
  }

  var newWidth = view.scrollWidth + rect.differenceX
  var newHeight = view.scrollHeight + rect.differenceY

  if (newWidth > view.width){
    if (rect.left - view.scrollX < 0 || rect.width > view.width){
      offset[0] += rect.top - view.scrollX
    } else if (rect.right - view.scrollX > view.width){
      offset[0] += rect.right - view.scrollX - view.width
    }
  }

  if (newHeight > view.height){
    if (rect.top - view.scrollY < 0 || rect.height > view.height){
      offset[1] += rect.top - view.scrollY
    } else if (rect.bottom - view.scrollY > view.height){
      offset[1] += rect.bottom - view.scrollY - view.height
    }
  } 

  lastDuration = duration
  process.nextTick(doScroll)
}

function doScroll(){
  if (offset[0] || offset[1]){
    scrollBy(offset, lastDuration)
    offset = [0,0]
  }
}

function setAbsoluteOffset(rect, element){
  while (element){

    if (element.style && window.getComputedStyle(element).position === 'fixed'){
      rect.fixed = true
      break
    }

    rect.top += element.offsetTop
    rect.bottom += element.offsetTop
    rect.left += element.offsetLeft
    rect.right += element.offsetLeft
    rect.element = element

    element = element.offsetParent
  }
}