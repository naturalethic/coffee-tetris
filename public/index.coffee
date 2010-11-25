window.p = (args...) -> console.log(a) for a in args

window.onload = ->
  window.onkeydown = (event) ->
    keyDown event
  start()

cellSize     = 20                           # The pixel dimension for a cell (board square)
boardWidth   = 10                           # Board width in cells
boardHeight  = 20                           # Board height in cells
canvasWidth  = boardWidth * cellSize  + 100 # The pixel width of the canvas
canvasHeight = boardHeight * cellSize       # The pixel height of the canvas

board = []
for y from 0 to boardHeight - 1
  row = []
  board.push row
  for x from 0 to boardWidth - 1
    row.push '#000'

west  = 37
north = 38
east  = 39
south = 40

score = 0

lastFallTime = 0.0 # The time (in seconds) at which the falling shape last fell
fallRate     = 0.5 # The rate (in seconds) at which the falling shape is falling
frameRate    = 16  # The frame rate
frameCount   = 0

shapeForm = '''
  ....
  .##.
  .##.
  ....

  .... ..#.
  #### ..#.
  .... ..#.
  .... ..#.

  .... ..#.
  ..## ..##
  .##. ...#
  .... ....

  .... ...#
  .##. ..##
  ..## ..#.
  .... ....

  .... ..#. ...# .##.
  .### ..#. .### ..#.
  .#.. ..## .... ..#.
  .... .... .... ....

  .... ..## .#.. ..#.
  .### ..#. .### ..#.
  ...# ..#. .... .##.
  .... .... .... ....

  .... ..#. ..#. ..#.
  .### ..## .### .##.
  ..#. ..#. .... ..#.
  .... .... .... ....
'''

shapeGroups = []

for shapeRow in shapeForm.split('\n\n')
  shapeGroup = []
  shapeGroups.push shapeGroup
  for line, y in shapeRow.split('\n')
    for word, shape in line.split(' ')
      if y == 0
        shapeGroup.push [[false, false, false, false]
                         [false, false, false, false]
                         [false, false, false, false]
                         [false, false, false, false]]
      for x from 0 to 3
        shapeGroup[shape][y][x] = true if word[x] == '#'

shapeColor = [
  '#f00'
  '#ff0'
  '#0f0'
  '#0ff'
  '#900'
  '#990'
  '#090'
]

canvas  = null
context = null

fallingShapeX          = 0 # The X position of the falling shape
fallingShapeY          = 0 # The Y position of the falling shape
fallingShapeGroupIndex = null
fallingShapeGroup      = null
fallingShapeIndex      = null
fallingShape           = null
fallingColor           = null

nextShape = ->
  fallingShapeX          = 3
  fallingShapeY          = 0
  fallingShapeGroupIndex = Math.floor( Math.random() * shapeGroups.length )
  fallingShapeGroup      = shapeGroups[fallingShapeGroupIndex]
  fallingShapeIndex      = 0
  fallingShape           = fallingShapeGroup[fallingShapeIndex]
  fallingColor           = shapeColor[fallingShapeGroupIndex]

ticker = null

start = ->
  canvas = document.getElementById 'canvas'
  canvas.style.backgroundColor = '#000'
  canvas.width  = canvasWidth + 1
  canvas.height = canvasHeight + 1
  context = canvas.getContext '2d'
  nextShape()
  draw()
  ticker = setInterval tick, 1000 / frameRate

tick = ->
  frameCount++
  currentTime = frameCount / frameRate
  nextFallTime = lastFallTime + fallRate
  if currentTime > nextFallTime
    moveShapeDown(true)
    lastFallTime = nextFallTime

keyDown = (event) ->
  return if not ticker
  switch event.keyCode
    when north
      rotateShape()
      draw()
    when west
      moveShapeLeft()
      draw()
    when east
      moveShapeRight()
      draw()
    when south
      moveShapeDown()

rotateShape = ->
  priorShape = fallingShape
  priorIndex = fallingShapeIndex
  if fallingShapeIndex < fallingShapeGroup.length - 1
    fallingShapeIndex++
  else
    fallingShapeIndex = 0
  fallingShape = fallingShapeGroup[fallingShapeIndex]
  if detectCollision()
    fallingShape = priorShape
    fallingShapeIndex = fallingShapeIndex

moveShapeDown = (tick) ->
  fallingShapeY++
  if detectCollision()
    fallingShapeY--
    flattenBoard()
    if not resolveBoard()
      if tick && fallingShapeY == 0
        endGame()
      else
        nextShape()
        if detectCollision()
          endGame()
  else
    draw()

moveShapeLeft = ->
  fallingShapeX--
  if detectCollision()
    fallingShapeX++

moveShapeRight = ->
  fallingShapeX++
  if detectCollision()
    fallingShapeX--

detectCollision = ->
  for row, y in fallingShape
    for cell, x in row
      if cell
        if ( fallingShapeY + y >= boardHeight or
             fallingShapeX + x < 0 or
             fallingShapeX + x >= boardWidth or
             board[fallingShapeY + y][fallingShapeX + x] != '#000' )
          return true
  return false

flattenBoard = ->
  for row, y in fallingShape
    for cell, x in row
      if cell
        board[fallingShapeY + y][fallingShapeX + x] = fallingColor

resolveBoard = ->
  for y from boardHeight - 1 to 0
    count = 0
    for x from 0 to boardWidth - 1
      count++ if board[y][x] != '#000'
    if count == boardWidth
      removeRow y
      return true
  return false

removeRow = (r) ->
  clearInterval ticker
  ticker = null
  score++
  flashCount = 6
  originalRow = board[r]
  flashRow = []
  for i from 0 to boardWidth - 1
    flashRow[i] = '#FFF'
  flash = ->
    if board[r] == flashRow
      board[r] = originalRow
    else
      board[r] = flashRow
    context.clearRect 0, 0, canvasWidth, canvasHeight
    drawBoard()
    drawScore()
    if flashCount-- == 0
      clearInterval flasher
      board.unshift( board.splice r, 1 )
      for i from 0 to boardWidth - 1
        board[0][i] = '#000'
      if not resolveBoard()
        nextShape()
        if detectCollision()
          endGame()
        draw()
        ticker = setInterval tick, 1000 / frameRate
  flash()
  flasher = setInterval flash, 70

endGame = ->
  clearInterval ticker
  ticker = null
  context.font = '28px Helvetica'
  context.strokeStyle = '#FFF'
  context.fillStyle = '#FFF'
  context.fillText 'GAME OVER', 17, 200

draw = ->
  context.clearRect 0, 0, canvasWidth, canvasHeight
  drawBoard()
  drawShape()
  drawScore()

drawBoard = ->
  context.strokeStyle = '#333'
  for x from 0 to boardWidth - 1
    for y from 0 to boardHeight - 1
      drawCell x * cellSize, y * cellSize, board[y][x]

drawShape = ->
  for row, y in fallingShape
    for cell, x in row
      if cell
        drawCell (fallingShapeX + x) * cellSize, (fallingShapeY + y) * cellSize, fallingColor

drawCell = (x, y, color) ->
  context.strokeStyle = '#333'
  context.fillStyle = color
  context.fillRect x + 0.5, y + 0.5, cellSize, cellSize
  context.strokeRect x + 0.5, y + 0.5, cellSize, cellSize

drawScore = ->
  context.font = '18px Helvetica'
  context.strokeStyle = '#FFF'
  context.fillStyle = '#FFF'
  context.fillText 'Score: ' + score, canvasWidth - 90, 30
