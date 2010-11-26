global.fs     = require 'fs'
global.util   = require 'util'
global.http   = require 'http'
global.coffee = require 'coffee-script'
global.put    = (args...) -> util.print(a) for a in args
global.puts   = (args...) -> util.print(a + '\n') for a in args
global.p      = (args...) -> puts(util.inspect(a, true, null)) for a in args

server = http.createServer (req, res) ->
  puts 'GET ' + req.url
  path = req.url
  path += 'index' if path.indexOf('/') == path.length - 1
  path += '.html' if path.indexOf('.') == -1
  path = path.substr(1) if path[0] == '/'
  ext = path.split('.').pop()
  fs.stat path, (err, stat) ->
    if ext == 'js'
      coffee_path = path.substr(0, path.length - 2) + 'coffee'
      try
        coffee_stat = fs.statSync coffee_path
        try
          fs.writeFileSync(path, coffee.compile(fs.readFileSync(coffee_path, 'utf-8')), 'utf-8')
          stat = fs.statSync path
    if stat
      switch ext
        when 'html'
          res.writeHead 200, { 'content-type': 'text/html' }
          fs.readFile path, 'utf-8', (err, data) ->
            res.end data
        when 'js'
          res.writeHead 200, { 'content-type': 'text/javascript' }
          fs.readFile path, 'utf-8', (err, data) ->
            res.end data
        else
          res.writeHead 404
          res.end()
    else
      res.writeHead 404
      res.end()

server.listen 3000
puts 'Tetris started on port 3000'