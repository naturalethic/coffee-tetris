(function() {
  var board, boardHeight, boardWidth, canvas, canvasHeight, canvasWidth, cellSize, context, detectCollision, draw, drawBoard, drawCell, drawScore, drawShape, east, endGame, fallRate, fallingColor, fallingShape, fallingShapeGroup, fallingShapeGroupIndex, fallingShapeIndex, fallingShapeX, fallingShapeY, flattenBoard, frameCount, frameRate, keyDown, lastFallTime, line, moveShapeDown, moveShapeLeft, moveShapeRight, nextShape, north, removeRow, resolveBoard, rotateShape, row, score, shape, shapeColor, shapeForm, shapeGroup, shapeGroups, shapeRow, south, start, tick, ticker, west, word, x, y, _i, _len, _len2, _len3, _ref, _ref2, _ref3;
  var __slice = Array.prototype.slice;
  window.p = function() {
    var a, args, _i, _len, _results;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      a = args[_i];
      _results.push(console.log(a));
    }
    return _results;
  };
  window.onload = function() {
    window.onkeydown = function(event) {
      return keyDown(event);
    };
    return start();
  };
  cellSize = 20;
  boardWidth = 10;
  boardHeight = 20;
  canvasWidth = boardWidth * cellSize + 100;
  canvasHeight = boardHeight * cellSize;
  board = [];
  for (y = 0; (0 <= boardHeight ? y < boardHeight : y > boardHeight); (0 <= boardHeight ? y += 1 : y -= 1)) {
    row = [];
    board.push(row);
    for (x = 0; (0 <= boardWidth ? x < boardWidth : x > boardWidth); (0 <= boardWidth ? x += 1 : x -= 1)) {
      row.push('#000');
    }
    x--;
  }
  y--;
  west = 37;
  north = 38;
  east = 39;
  south = 40;
  score = 0;
  lastFallTime = 0.0;
  fallRate = 0.5;
  frameRate = 16;
  frameCount = 0;
  shapeForm = '....\n.##.\n.##.\n....\n\n.... ..#.\n#### ..#.\n.... ..#.\n.... ..#.\n\n.... ..#.\n..## ..##\n.##. ...#\n.... ....\n\n.... ...#\n.##. ..##\n..## ..#.\n.... ....\n\n.... ..#. ...# .##.\n.### ..#. .### ..#.\n.#.. ..## .... ..#.\n.... .... .... ....\n\n.... ..## .#.. ..#.\n.### ..#. .### ..#.\n...# ..#. .... .##.\n.... .... .... ....\n\n.... ..#. ..#. ..#.\n.### ..## .### .##.\n..#. ..#. .... ..#.\n.... .... .... ....';
  shapeGroups = [];
  _ref = shapeForm.split('\n\n');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    shapeRow = _ref[_i];
    shapeGroup = [];
    shapeGroups.push(shapeGroup);
    _ref2 = shapeRow.split('\n');
    for (y = 0, _len2 = _ref2.length; y < _len2; y++) {
      line = _ref2[y];
      _ref3 = line.split(' ');
      for (shape = 0, _len3 = _ref3.length; shape < _len3; shape++) {
        word = _ref3[shape];
        if (y === 0) {
          shapeGroup.push([[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]]);
        }
        for (x = 0; x <= 3; x++) {
          if (word[x] === '#') {
            shapeGroup[shape][y][x] = true;
          }
        }
        x--;
      }
    }
  }
  shapeColor = ['#f00', '#ff0', '#0f0', '#0ff', '#900', '#990', '#090'];
  canvas = null;
  context = null;
  fallingShapeX = 0;
  fallingShapeY = 0;
  fallingShapeGroupIndex = null;
  fallingShapeGroup = null;
  fallingShapeIndex = null;
  fallingShape = null;
  fallingColor = null;
  nextShape = function() {
    fallingShapeX = 3;
    fallingShapeY = 0;
    fallingShapeGroupIndex = Math.floor(Math.random() * shapeGroups.length);
    fallingShapeGroup = shapeGroups[fallingShapeGroupIndex];
    fallingShapeIndex = 0;
    fallingShape = fallingShapeGroup[fallingShapeIndex];
    return fallingColor = shapeColor[fallingShapeGroupIndex];
  };
  ticker = null;
  start = function() {
    canvas = document.getElementById('canvas');
    canvas.style.backgroundColor = '#000';
    canvas.width = canvasWidth + 1;
    canvas.height = canvasHeight + 1;
    context = canvas.getContext('2d');
    nextShape();
    draw();
    return ticker = setInterval(tick, 1000 / frameRate);
  };
  tick = function() {
    var currentTime, nextFallTime;
    frameCount++;
    currentTime = frameCount / frameRate;
    nextFallTime = lastFallTime + fallRate;
    if (currentTime > nextFallTime) {
      moveShapeDown(true);
      return lastFallTime = nextFallTime;
    }
  };
  keyDown = function(event) {
    if (!ticker) {
      return;
    }
    switch (event.keyCode) {
      case north:
        rotateShape();
        return draw();
        break;
      case west:
        moveShapeLeft();
        return draw();
        break;
      case east:
        moveShapeRight();
        return draw();
        break;
      case south:
        return moveShapeDown();
    }
  };
  rotateShape = function() {
    var priorIndex, priorShape;
    priorShape = fallingShape;
    priorIndex = fallingShapeIndex;
    if (fallingShapeIndex < fallingShapeGroup.length - 1) {
      fallingShapeIndex++;
    } else {
      fallingShapeIndex = 0;
    }
    fallingShape = fallingShapeGroup[fallingShapeIndex];
    if (detectCollision()) {
      fallingShape = priorShape;
      return fallingShapeIndex = fallingShapeIndex;
    }
  };
  moveShapeDown = function(tick) {
    fallingShapeY++;
    if (detectCollision()) {
      fallingShapeY--;
      flattenBoard();
      if (!resolveBoard()) {
        if (tick && fallingShapeY === 0) {
          return endGame();
        } else {
          nextShape();
          if (detectCollision()) {
            return endGame();
          }
        }
      }
    } else {
      return draw();
    }
  };
  moveShapeLeft = function() {
    fallingShapeX--;
    if (detectCollision()) {
      return fallingShapeX++;
    }
  };
  moveShapeRight = function() {
    fallingShapeX++;
    if (detectCollision()) {
      return fallingShapeX--;
    }
  };
  detectCollision = function() {
    var cell, row, x, y, _len, _len2, _ref;
    _ref = fallingShape;
    for (y = 0, _len = _ref.length; y < _len; y++) {
      row = _ref[y];
      for (x = 0, _len2 = row.length; x < _len2; x++) {
        cell = row[x];
        if (cell) {
          if (fallingShapeY + y >= boardHeight || fallingShapeX + x < 0 || fallingShapeX + x >= boardWidth || board[fallingShapeY + y][fallingShapeX + x] !== '#000') {
            return true;
          }
        }
      }
    }
    return false;
  };
  flattenBoard = function() {
    var cell, row, x, y, _len, _len2, _ref, _results, _results2;
    _ref = fallingShape;
    _results = [];
    for (y = 0, _len = _ref.length; y < _len; y++) {
      row = _ref[y];
      _results.push((function() {
        _results2 = [];
        for (x = 0, _len2 = row.length; x < _len2; x++) {
          cell = row[x];
          _results2.push(cell ? board[fallingShapeY + y][fallingShapeX + x] = fallingColor : void 0);
        }
        return _results2;
      })());
    }
    return _results;
  };
  resolveBoard = function() {
    var count, x, y, _ref;
    for (y = _ref = boardHeight - 1; (_ref <= 0 ? y <= 0 : y >= 0); (_ref <= 0 ? y += 1 : y -= 1)) {
      count = 0;
      for (x = 0; (0 <= boardWidth ? x < boardWidth : x > boardWidth); (0 <= boardWidth ? x += 1 : x -= 1)) {
        if (board[y][x] !== '#000') {
          count++;
        }
      }
      x--;
      if (count === boardWidth) {
        removeRow(y);
        return true;
      }
    }
    y--;
    return false;
  };
  removeRow = function(r) {
    var flash, flashCount, flashRow, flasher, i, originalRow;
    clearInterval(ticker);
    ticker = null;
    score++;
    flashCount = 6;
    originalRow = board[r];
    flashRow = [];
    for (i = 0; (0 <= boardWidth ? i < boardWidth : i > boardWidth); (0 <= boardWidth ? i += 1 : i -= 1)) {
      flashRow[i] = '#FFF';
    }
    i--;
    flash = function() {
      var i;
      if (board[r] === flashRow) {
        board[r] = originalRow;
      } else {
        board[r] = flashRow;
      }
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      drawBoard();
      drawScore();
      if (flashCount-- === 0) {
        clearInterval(flasher);
        board.unshift(board.splice(r, 1));
        for (i = 0; (0 <= boardWidth ? i < boardWidth : i > boardWidth); (0 <= boardWidth ? i += 1 : i -= 1)) {
          board[0][i] = '#000';
        }
        i--;
        if (!resolveBoard()) {
          nextShape();
          if (detectCollision()) {
            endGame();
          }
          draw();
          return ticker = setInterval(tick, 1000 / frameRate);
        }
      }
    };
    flash();
    return flasher = setInterval(flash, 70);
  };
  endGame = function() {
    clearInterval(ticker);
    ticker = null;
    context.font = '28px Helvetica';
    context.strokeStyle = '#FFF';
    context.fillStyle = '#FFF';
    return context.fillText('GAME OVER', 17, 200);
  };
  draw = function() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBoard();
    drawShape();
    return drawScore();
  };
  drawBoard = function() {
    var x, y, _results, _results2;
    context.strokeStyle = '#333';
    _results = [];
    for (y = 0; (0 <= boardHeight ? y < boardHeight : y > boardHeight); (0 <= boardHeight ? y += 1 : y -= 1)) {
      _results.push((function() {
        _results2 = [];
        for (x = 0; (0 <= boardWidth ? x < boardWidth : x > boardWidth); (0 <= boardWidth ? x += 1 : x -= 1)) {
          _results2.push(drawCell(x * cellSize, y * cellSize, board[y][x]));
        }
        x--;
        return _results2;
      })());
    }
    y--;
    return _results;
  };
  drawShape = function() {
    var cell, row, x, y, _len, _len2, _ref, _results, _results2;
    _ref = fallingShape;
    _results = [];
    for (y = 0, _len = _ref.length; y < _len; y++) {
      row = _ref[y];
      _results.push((function() {
        _results2 = [];
        for (x = 0, _len2 = row.length; x < _len2; x++) {
          cell = row[x];
          _results2.push(cell ? drawCell((fallingShapeX + x) * cellSize, (fallingShapeY + y) * cellSize, fallingColor) : void 0);
        }
        return _results2;
      })());
    }
    return _results;
  };
  drawCell = function(x, y, color) {
    context.strokeStyle = '#333';
    context.fillStyle = color;
    context.fillRect(x + 0.5, y + 0.5, cellSize, cellSize);
    return context.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);
  };
  drawScore = function() {
    context.font = '18px Helvetica';
    context.strokeStyle = '#FFF';
    context.fillStyle = '#FFF';
    return context.fillText('Score: ' + score, canvasWidth - 90, 30);
  };
}).call(this);
