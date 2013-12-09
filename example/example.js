var fs = require('fs') // using brfs transform so that this works in the browser

var morph = require('../')
var jsonQuery = require('json-query')
var become = require('become')
var ready = require('domready')

var View = require('rincewind')
var Form = require('former')

var data = {
  page: {
    title: 'A page title',
    body: 'Lots of content'
  }
}

var handleQuery = function(query, templateContext){
  return jsonQuery(query, { 
    rootContext: data, 
    context: templateContext.source 
  }).value
}

var renderView = View(fs.readFileSync('view.html', 'utf8'))
var renderEditor = View(fs.readFileSync('editor.html', 'utf8'))

ready(function(){
  
  document.body.innerHTML = null

  renderView(handleQuery).forEach(function(element){
    document.body.appendChild(element)
  })

  document.getElementById('editButton').addEventListener('click', edit)
})

function refresh(){
  become(document.body.childNodes, renderView(handleQuery))
}

function edit(){
  var element = document.getElementById('page')
  var editor = Form(renderEditor(handleQuery)[0], data.page, function(action, object){
    
    if (action == 'save'){
      data.page.title = object.title
      data.page.body = object.body
      refresh()
    }

    unmorph()
  })

  var unmorph = morph(element, editor, {fit: true})
}