var scrollBy = require('css-scroll-by')

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

  var newWidth = view.scrollWidth + rect.differenceX
  var newHeight = view.scrollHeight + rect.differenceY

  var offset = [0,0]
  if (newWidth > view.width){
    if (rect.left - view.scrollX < 0 || rect.width > view.width){
      offset[0] = rect.top - view.scrolvlX
    } else if (rect.right - view.scrollX > view.width){
      offset[0] = rect.right - view.scrollX - view.width
    }
  }

  if (newHeight > view.height){
    if (rect.top - view.scrollY < 0 || rect.height > view.height){
      offset[1] = rect.top - view.scrollY
    } else if (rect.bottom - view.scrollY > view.height){
      offset[1] = rect.bottom - view.scrollY - view.height
    }
  } 

  scrollBy(offset, duration)
}