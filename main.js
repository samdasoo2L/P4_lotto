const startButton = document.querySelector(".start");
const resetButton = document.querySelector(".reset-all");
const numUl = document.querySelector(".num-ul");
const bonusUl = document.querySelector(".bonus-ul");

const numArr = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45,
];
const selectedNumArr = [];

function resetResult() {
  selectedNumArr.splice(0);
  numUl.replaceChildren();
  bonusUl.replaceChildren();
}

function selectNum(numArr) {
  const index = Math.floor(Math.random() * numArr.length);
  selectedNumArr.push(numArr[index]);
  numArr.splice(index, 1);
  return numArr;
}

function makeLi(location, num) {
  console.log("aaa");
  const newLi = document.createElement("li");
  newLi.innerText = num;
  location.appendChild(newLi);
}

async function lotto() {
  // 이전요소&데이터 리셋
  startButton.disabled = true;
  resetButton.disabled = true;
  startButton.innerText = "Restart!";
  resetResult();
  const copyNumArr = [...numArr];
  //   const newNumArr = [];
  //   for (let i = 1; i <= 45; i++) {
  //     newNumArr.push(i);
  //   }

  //   숫자선정
  for (let i = 0; i < 6; i++) {
    selectNum(copyNumArr);
    // console.log(selectedNumArr);
    // console.log(copyNumArr);
  }
  //   숫자정렬
  selectedNumArr.sort((num1, num2) => num1 - num2);
  //   console.log(selectedNumArr);
  //  숫자 요소 만들기
  for (let num in selectedNumArr) {
    setTimeout(() => {
      makeLi(numUl, selectedNumArr[num]);
    }, 500 + 300 * num);
  }

  //   보너스선정 & 보너스 요소 만들기
  const bonusNum = copyNumArr[Math.floor(Math.random() * copyNumArr.length)];
  setTimeout(() => makeLi(bonusUl, bonusNum), 2300);
  setTimeout(() => {
    startButton.disabled = false;
    resetButton.disabled = false;
  }, 2400);
}

function resetLotto() {
  resetResult();
  startButton.innerText = "Start!";
}

startButton.addEventListener("click", lotto);
resetButton.addEventListener("click", resetLotto);
