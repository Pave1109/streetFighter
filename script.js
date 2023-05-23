//проверка коллизий 
function aabbCollision({ rectangle1, rectangle2 })
{
  return (
    rectangle1.attackHitbox.pos.x + rectangle1.attackHitbox.width >= rectangle2.pos.x
    && rectangle1.attackHitbox.pos.x <= rectangle2.pos.x + rectangle2.width
    && rectangle1.attackHitbox.pos.y + rectangle1.attackHitbox.height >= rectangle2.pos.y
    && rectangle1.attackHitbox.pos.y <= rectangle2.pos.y + rectangle2.height
  )
}

//функция которая проверяет победителя
function checkWinner({ player, player2, timerId }) {
  clearTimeout(timerId);
  var displayText = document.getElementById("displayText");
  displayText.style.display = 'flex';

  if (player.health === player2.health) {
    displayText.innerHTML = 'red';
    displayText.style.fontFamily = 'Impact'; // Устанавливает шрифт Impact
    displayText.style.color = 'red'; // Устанавливает черный цвет текста
  } else if (player.health > player2.health) {
    displayText.innerHTML = 'Игрок 1 победил';
    displayText.style.fontFamily = 'Impact'; // Устанавливает шрифт Impact
    displayText.style.color = 'black'; // Устанавливает черный цвет текста
  } else if (player.health < player2.health) {
    displayText.innerHTML = 'Игрок 2 победил';
    displayText.innerHTML = 'Игрок 2 победил';
    displayText.style.fontFamily = 'Impact'; // Устанавливает шрифт Impact
    displayText.style.color = 'red'; // Устанавливает черный цвет текста
  }
}
//запускает таймер на 60 сек
let timer = 60
let timerId
function countTimer()
{
  if (timer > 0)
  {
    timerId = setTimeout(countTimer, 1000)
    timer--
    document.getElementById("timer").innerHTML = timer
  }
  if (timer === 0)
    checkWinner({ player, player2, timerId })
}
// Классы
//конструктор который инициализирует все на экран 
class asset {
  constructor({ pos, imageSource, scale = 1, animationLength = 1, offset = { x: 0, y: 0 } })
  {
    this.pos = pos
    this.width = 50
    this.height = 150
    this.image = new Image()
    this.image.src = imageSource
    this.scale = scale
    this.animationLength = animationLength
    this.current = 0
    this.animationElapsed = 0
    this.animationHold = 5
    this.offset = offset
  }
    //отрисовка asset на холсте канвас 
  draw()
  {
    context.drawImage(
      this.image,
      this.current * (this.image.width / this.animationLength),
      0,
      this.image.width / this.animationLength,
      this.image.height,
      this.pos.x - this.offset.x,
      this.pos.y - this.offset.y,
      (this.image.width / this.animationLength) * this.scale,
      this.image.height * this.scale
    )
  }
    //переключение кадров между собой 
  animateFrames()
  {
    this.animationElapsed++
    if (this.animationElapsed % this.animationHold === 0)
    {
      if (this.current < this.animationLength - 1)
        this.current++
      else
        this.current = 0
    }
  }
    //онбовление кадров
  update()
  {
    this.draw()
    this.animateFrames()
  }
}
//Наследник предыдущего класса и добавляет дополнительные сво-ва для персонажа
class Fighter extends asset {
  constructor({ pos, speed, inAir, color = 'red', imageSource,
    scale = 1, animationLength = 1, offset = { x: 0, y: 0 },
    assets, attackHitbox = { offset: {}, width: undefined, height: undefined }
  })
  {
    super({ pos, imageSource, scale, animationLength, offset })
    this.speed = speed
    this.width = 50
    this.height = 150
    this.lastKey
    this.attackHitbox = {
      pos: { x: this.pos.x, y: this.pos.y },
      offset: attackHitbox.offset,
      width: attackHitbox.width,
      height: attackHitbox.height
    }
    this.inAir = false
    this.color = color
    this.isAttacking
    this.health = 100
    this.current = 0
    this.animationElapsed = 0
    this.animationHold = 5
    this.assets = assets
    this.dead = false

    for (const asset in this.assets)
    {
      assets[asset].image = new Image()
      assets[asset].image.src = assets[asset].imageSource
    }
  }
    //Обновляет состояние персонажа
  update() {
    this.draw()
    if (!this.dead)
      this.animateFrames()

    this.attackHitbox.pos.x = this.pos.x + this.attackHitbox.offset.x
    this.attackHitbox.pos.y = this.pos.y + this.attackHitbox.offset.y

    this.pos.x += this.speed.x
    this.pos.y += this.speed.y

    if (this.pos.y + this.height + this.speed.y >= canvas.height - 96)
    {
      this.speed.y = 0
      this.pos.y = 330
    }
    else
      this.speed.y += gravity
  }
    //отвечает за атаку
  attack()
  {
    this.changeasset('attack')
    this.isAttacking = true
  }
    //Отвечает за нанесение урона
  takeHit()
  {
    this.health -= 20
    if (this.health <= 0)
      this.changeasset('die')
  }
    //изменение asset персонажал дял смены анимации 
  changeasset(asset) {
    if (this.image === this.assets.die.image)
    {
      if (this.current === this.assets.die.animationLength - 1)
        this.dead = true
      return
    }

    if (this.image === this.assets.attack.image
      && this.current < this.assets.attack.animationLength - 1)
      return

    switch (asset) {
      case 'idle':
        if (this.image !== this.assets.idle.image)
        {
          this.image = this.assets.idle.image
          this.animationLength = this.assets.idle.animationLength
          this.current = 0
        }
        break

      case 'run':
        if (this.image !== this.assets.run.image)
        {
          this.image = this.assets.run.image
          this.animationLength = this.assets.run.animationLength
          this.current = 0
        }
        break

      case 'attack':
        if (this.image !== this.assets.attack.image)
        {
          this.image = this.assets.attack.image
          this.animationLength = this.assets.attack.animationLength
          this.current = 0
        }
        break

      case 'die':
        if (this.image !== this.assets.die.image)
        {
          this.image = this.assets.die.image
          this.animationLength = this.assets.die.animationLength
          this.current = 0
        }
        break
    }
  }
}
// Main 
const canvas = document.querySelector('canvas')// создает слой canvas 
const context = canvas.getContext('2d')
//параметры слоя 
canvas.width = 1024
canvas.height = 576

context.fillRect(0, 0, canvas.width, canvas.height)
//параметры игры 
const gravity = 0.8
//фон игры 
const background = new asset({
  pos: { x: 0, y: 0 },
  imageSource: './img/background.png'
})
//параметры игрока 1 
const player = new Fighter({
  pos: {
    x: 100,
    y: 100
  },
  speed: {
    x: 0,
    y: 0
  },
  imageSource: './img/player/Idle.png',
  animationLength: 1,
  scale: 2.5,
  offset: {
    x: 45,
    y: -28
  },
  assets: {
    idle: {
      imageSource: './img/player/Idle.png',
      animationLength: 1
    },
    run: {
      imageSource: './img/player/Run.png',
      animationLength: 8
    },
    attack: {
      imageSource: './img/player/GroundCombo1.png',
      animationLength: 8
    },
    die: {
      imageSource: './img/player/Die.png',
      animationLength: 4
    }
  },
  attackHitbox: {
    offset: {
      x: -7,
      y: 25
    },
    width: 42,
    height: 50
  }
})
//параметры игрока 2
const player2 = new Fighter({
  pos: {
    x: 800,
    y: 100
  },
  speed: {
    x: 0,
    y: 0
  },
  imageSource: './img/player2/Idle.png',
  animationLength: 1,
  scale: 2.5,
  offset: {
    x: -45,
    y: -28
  },
  assets: {
    idle: {
      imageSource: './img/player2/Idle.png',
      animationLength: 1
    },
    run: {
      imageSource: './img/player2/Run.png',
      animationLength: 8
    },
    attack: {
      imageSource: './img/player2/GroundCombo1.png',
      animationLength: 8
    },
    die: {
      imageSource: './img/player2/Die.png',
      animationLength: 4
    }
  },
  attackHitbox: {
    offset: {
      x: -7,
      y: 25
    },
    width: 42,
    height: 50
  }
})
//нажатие клавиш 
const key = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}
countTimer()
//отвечает за анимацию 
function animate() {
  window.requestAnimationFrame(animate)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  context.fillStyle = 'rgba(255, 255, 255, 0.15)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  player2.update()

  player.speed.x = 0
  player2.speed.x = 0

  if (key.a.pressed && player.lastKey === 'a') {
    player.speed.x = -5
    player.changeasset('run')
  }
  else if (key.d.pressed && player.lastKey === 'd') {
    player.speed.x = 5
    player.changeasset('run')
  }
  else
    player.changeasset('idle')

  if (player.pos.x < 0)
    player.pos.x = 0
  if (player.pos.x > 980)
    player.pos.x = 980

  if (player.pos.y < 330)
    player.inAir = true
  else
    player.inAir = false

  if (player.speed.y < 0)
    player.changeasset('jump')

  if (key.ArrowLeft.pressed && player2.lastKey === 'ArrowLeft') {
    player2.speed.x = -5
    player2.changeasset('run')
  }
  else if (key.ArrowRight.pressed && player2.lastKey === 'ArrowRight') {
    player2.speed.x = 5
    player2.changeasset('run')
  }
  else
    player2.changeasset('idle')

  if (player2.pos.x < -90)
    player2.pos.x = -90
  if (player2.pos.x > 900)
    player2.pos.x = 900

  if (player2.pos.y < 330)
    player2.inAir = true
  else
    player2.inAir = false
//проверка на попаданиек для уменьшения здоровья 
  if (aabbCollision({ rectangle1: player, rectangle2: player2 })
    && player.isAttacking
    && player.current === 4)
  {
    player2.takeHit()
    player.isAttacking = false
    document.getElementById("player2Health").style.width = player2.health + '%'
  }
  if (player.isAttacking && player.current === 4)
    player.isAttacking = false

  if (aabbCollision({ rectangle1: player2, rectangle2: player })
    && player2.isAttacking
    && player2.current === 4)
  {
    player.takeHit()
    player2.isAttacking = false
    document.getElementById("playerHealth").style.width = player.health + '%'
  }
  if (player2.isAttacking && player2.current === 4)
    player2.isAttacking = false
  if (player2.health <= 0 || player.health <= 0)
    checkWinner({ player, player2, timerId })
}

animate()
//считывает какая клавиша нажата чтобы определить действие персонажа
window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        key.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        key.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        if (!player.inAir)
          player.speed.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!player2.dead) {
    switch (event.key) {
      case 'ArrowRight':
        key.ArrowRight.pressed = true
        player2.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        key.ArrowLeft.pressed = true
        player2.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        if (!player2.inAir)
          player2.speed.y = -20
        break
      case 'ArrowDown':
        player2.attack()
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      key.d.pressed = false
      break
    case 'a':
      key.a.pressed = false
      break
  }
  // P2
  switch (event.key) {
    case 'ArrowRight':
      key.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      key.ArrowLeft.pressed = false
      break
  }
})
