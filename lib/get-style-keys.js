module.exports = getStyleKeys

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

function isNumeric(text){
  return /^[0-9]+$/.test(text)
}