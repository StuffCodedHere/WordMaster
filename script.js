const xpCountElement = document.querySelector("body > div:first-child > span > span")
const winningState = document.querySelector("h2")
const grid = document.querySelector(".grid")
const keyboard = document.querySelector(".keyboard")

const random = (min, max) => Math.floor(Math.random() * (max + 1 - min) + min)
const filterTheWords = (length) => words.filter((word) => word.length === length)
document.querySelectorAll(".key").forEach((key) => (key.onclick = () => writeTheLetter(key.innerHTML)))

let currentBox
let currentBoxes
let currentRow
let tempGridRowCount = 0
let rowCount = 1
let maxRows = 6
let boxCount = 0
let maxBoxes = 1
let xpCount = 0
let win = false
let intervalRate = localStorage.xpCount !== undefined ? Math.floor(1500 / parseInt(localStorage.xpCount)) : 200
let guessedWords = localStorage.guessedWords !== undefined ? JSON.parse(localStorage.guessedWords) : []
let allTheWords =
 "let,us,remember,listen,point,and,say,i,have,a,new,game,what,time,is,it,he,my,teacher,she,doctor,sunny,day,to,the,park,these,are,favorite,cookies,this,umbrella,goodbye,see,you,later,"

let words = allTheWords.split(",").sort((a, b) => a.length - b.length)
words.shift()
let goal
let trueAnswer = ""
const flipSound = new Audio("Low-Pitched-Flip.mp3")

const keyShadow = window.getComputedStyle(document.documentElement).getPropertyValue("--key-shadow")
const greatShadow = window.getComputedStyle(document.documentElement).getPropertyValue("--great-shadow")
const okShadow = window.getComputedStyle(document.documentElement).getPropertyValue("--ok-shadow")
const badShadow = window.getComputedStyle(document.documentElement).getPropertyValue("--bad-shadow")

for (let i = 0; i < maxRows; i++) {
 const row = document.createElement("div")
 row.classList.add("row")
 grid.appendChild(row)

 for (let j = 0; j < maxBoxes; j++) {
  const box = document.createElement("div")
  box.innerHTML = "_"
  row.appendChild(box)
 }
}

const updateCurrents = (updatedRowCount, updatedBoxCount) => {
 currentRow = document.querySelector(`.grid > div:nth-child(${updatedRowCount})`)
 currentBox = document.querySelector(`.grid > div:nth-child(${updatedRowCount}) > div:nth-child(${updatedBoxCount})`)
 currentBoxes = document.querySelectorAll(`.grid > div:nth-child(${updatedRowCount}) > div`)
}
updateCurrents(rowCount, boxCount)

setTimeout(adderAnimation, 4000)

function chooseGoal() {
 let chosenLengthArray = filterTheWords(maxBoxes).filter((word) => !guessedWords.includes(word))
 if (chosenLengthArray.length === 0) {
  maxBoxes++
  for (let i = 0; i < maxRows; i++) {
   const box = document.createElement("div")
   box.innerHTML = "_"
   document.querySelector(`.grid > div:nth-child(${i + 1})`).appendChild(box)
   if (maxBoxes >= 4)
    Array.from(document.querySelectorAll(`.grid > div:nth-child(${i + 1}) > div`)).forEach(
     (box) => (box.style.width = "calc(var(--text-size) * 3.5)")
    )
  }
 }
 chosenLengthArray = filterTheWords(maxBoxes).filter((word) => !guessedWords.includes(word))
 goal = chosenLengthArray[random(0, chosenLengthArray.length - 1)]
 document.documentElement.style.setProperty("--xp-left", parseInt(window.getComputedStyle(currentRow).getPropertyValue("width")) + 40 + "px")
 if (goal === undefined) chooseGoal()
}
chooseGoal()

function adderAnimation() {
 let tempXPCount = 0
 const startAdder = setInterval(() => {
  if (!localStorage.xpCount || tempXPCount === parseInt(localStorage.xpCount)) {
   clearInterval(startAdder)
   tempXPCount = 0
   return
  }
  tempXPCount++
  xpCountElement.innerHTML = tempXPCount
 }, intervalRate)
}

const xpTimer = setInterval(() => {
 tempGridRowCount++
 const xpElement = document.querySelector(`.grid > div:nth-child(${tempGridRowCount})`)
 xpElement.style.setProperty("--XP-opacity", 1)
 setTimeout(() => xpElement.style.setProperty("--XP-opacity", 0), 300)
 if (tempGridRowCount === maxRows) clearInterval(xpTimer)
}, 300)

document.addEventListener("keyup", (e) => {
 if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) writeTheLetter(e.key)
 if (e.key === "Backspace") removeTheLetter()
 if (e.key === "Enter") checkTheAnswer()
})

function writeTheLetter(letter) {
 if (boxCount === maxBoxes || rowCount > maxRows || win) return
 boxCount = boxCount < maxBoxes ? boxCount + 1 : boxCount
 updateCurrents(rowCount, boxCount)
 currentBox.style.borderColor = "var(--bad-shadow)"
 currentBox.innerHTML = letter
}
function removeTheLetter() {
 if (boxCount === 0) return
 updateCurrents(rowCount, boxCount)
 currentBox.style.borderColor = "var(--bad-color)"
 currentBox.innerHTML = "_"
 boxCount--
}

function checkTheAnswer() {
 if (boxCount !== maxBoxes || rowCount > maxRows || notAWord()) return

 winningState.innerHTML = ""

 updateCurrents(rowCount, boxCount)
 for (let i = 0; i < currentBoxes.length; i++) {
  currentBoxes[i].style.animationDelay = i / 5 + "s"
  currentBoxes[i].style.borderColor = "transparent"

  const correct = goal[i] === currentBoxes[i].textContent
  const incorrect = goal.indexOf(currentBoxes[i].textContent) === -1
  const maybe = !correct && !incorrect

  if (incorrect) currentBoxes[i].classList.add("incorrect")
  else if (maybe) currentBoxes[i].classList.add("maybe")
  else if (correct) currentBoxes[i].classList.add("correct")

  setTimeout(() => colorTheKeyboard(currentBoxes[i]), 1500)
 }
 let something = 0
 const playSound = setInterval(() => {
  something++
  flipSound.play()
  if (something === maxBoxes) clearInterval(playSound)
 }, 200)

 announceWinning()
 rowCount++
 boxCount = 0
}

function notAWord() {
 let answer = ""
 for (let i = 0; i < currentBoxes.length; i++) answer += currentBoxes[i].textContent
 trueAnswer = answer
 if (words.indexOf(answer) === -1) {
  winningState.innerHTML = "Not A Word!"
  answer = ""
  return true
 } else {
  answer = ""
  return false
 }
}

function colorTheKeyboard(box) {
 document.querySelectorAll(".key").forEach((key) => {
  const condition = box.textContent === key.textContent && key.style.backgroundColor !== "rgb(0, 100, 100)"
  if (condition) key.style.backgroundColor = window.getComputedStyle(box).backgroundColor
  if (key.style.backgroundColor === "rgb(50, 50, 50)") key.style.setProperty("--key-shadow", badShadow)
  else if (key.style.backgroundColor === "rgb(200, 100, 0)") key.style.setProperty("--key-shadow", okShadow)
  else if (key.style.backgroundColor === "rgb(0, 100, 100)") key.style.setProperty("--key-shadow", greatShadow)
 })
}

function announceWinning() {
 win = Array.from(currentBoxes).every((box) => box.classList.contains("correct"))
 if (rowCount === maxRows && !win) restart()
 if (!win) return

 guessedWords = localStorage.guessedWords ? JSON.parse(localStorage.guessedWords) : guessedWords
 if (!guessedWords.includes(trueAnswer)) guessedWords.push(trueAnswer)
 localStorage.setItem("guessedWords", JSON.stringify(guessedWords))
 winningState.innerHTML = "Take A Bow!"
 currentRow.style.setProperty("--XP-opacity", 1)
 const movementTopDistance = currentRow.getBoundingClientRect().top
 const textSize = parseInt(window.getComputedStyle(document.body).getPropertyValue("font-size"))
 document.documentElement.style.setProperty("--movement-top-distance", Math.floor(-movementTopDistance) + textSize + 20 + "px")
 currentRow.classList.add("animate")
 setTimeout(() => addUpTheXP(maxRows + 1 - rowCount, currentRow), 3000)
 restart()
}

function addUpTheXP(xp, currentRow) {
 currentRow.style.setProperty("--XP-opacity", 0)
 const adder = setInterval(() => {
  console.log(xpCount, xp)
  xpCount++
  xpCountElement.innerHTML = localStorage.xpCount ? parseInt(localStorage.xpCount) + xpCount : xpCount
  if (xpCount > xp) {
   clearInterval(adder)
   localStorage.setItem("xpCount", localStorage.xpCount ? parseInt(localStorage.xpCount) + xpCount : xpCount)
   xpCount = 0
   setTimeout(() => currentRow.classList.remove("animate"), 1000)
  }
 }, intervalRate)
}

const handleRestart = (e) => (e.key === " " ? clearGrid() : "")

function restart() {
 if (win) winningState.innerHTML = "Take A Bow!<br><span class='restart-text'>Press Space to Continue</span>"
 else winningState.innerHTML = "You Can Do It!<br><span class='restart-text'>Press Space to Continue</span>"
 winningState.style.opacity = "1"
 document.addEventListener("keyup", handleRestart)
}

function clearGrid() {
 document.removeEventListener("keyup", handleRestart)
 for (let i = maxRows; i > 0; i--) {
  for (let j = maxBoxes; j > 0; j--) {
   const targetBox = document.querySelector(`.grid > div:nth-child(${i}) > div:nth-child(${j})`)
   targetBox.innerHTML = "_"
   if (targetBox.classList.length > 0) targetBox.classList.remove(targetBox.className)
   targetBox.style.borderColor = "var(--bad-color)"
   winningState.innerHTML = ""
   win = false
   rowCount = 1
   boxCount = 0
   document.querySelectorAll(".key").forEach((key) => {
    key.style.setProperty("--key-shadow", keyShadow)
    key.style.background = "var(--key-color)"
    key.style.boxShadow = "inset 2px 2px var(--key-shadow)"
   })
   chooseGoal()
  }
 }
}
