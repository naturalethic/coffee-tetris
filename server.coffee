global.fs      = require 'fs'
global.util    = require 'util'
global.coffee  = require 'coffee-script'
global.put     = (args...) -> util.print(a) for a in args
global.puts    = (args...) -> util.print(a + '\n') for a in args
global.p       = (args...) -> puts(util.inspect(a, true, null)) for a in args

http = require('http')

server = http.createServer (req, res) ->
  p 'GET ' + req.url
  req.url += 'index' if req.url.indexOf('/') == req.url.length - 1
  path = 'public' + req.url
  path += '.html' if req.url.indexOf('.') == -1
  fs.stat path, (err, stat) ->
    if stat? and stat.isFile()
      ext = path.substring path.indexOf('.') + 1, path.length
      switch ext
        when 'html'
          res.writeHead 200, { 'content-type': 'text/html' }
          fs.readFile path, 'utf-8', (err, data) ->
            res.end data
        when 'coffee'
          fs.readFile path, 'utf-8', (err, data) ->
            try
              script = coffee.compile data
              res.writeHead 200, 'content-type': 'text/javascript'
              res.end script
            catch e
              p e
              res.writeHead 500
              res.end()
        when 'js'
          res.writeHead 200, { 'content-type': 'text/javascript' }
          fs.readFile path, 'utf-8', (err, data) ->
            res.end data
    else
      res.writeHead 404
      res.end()

server.listen 3000
puts 'Tetris started on port 3000'