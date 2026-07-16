// ==========================================================================
// [과제] Up-Down 숫자 맞추기 게임 (/script/upDown.js)
// ==========================================================================

// HTML에서 onclick="startGame()"을 호출하면 이 함수가 실행됩니다.
function startGame() {

    // 1. 게임이 시작될 때마다 새롭게 무작위 비밀 숫자를 고릅니다.
    //    var 대신 재할당이 필요 없는 값은 const, 필요한 값은 let을 사용합니다.
    const computerNum = Math.floor(Math.random() * 50) + 1;
    let count = 0;
    const guessHistory = [];   // 지금까지 입력한 숫자를 배열에 기록

    // 치트키 콘솔로그 (F12 콘솔 탭에서 확인 가능)
    console.log("이번 판 컴퓨터의 비밀 숫자:", computerNum);

    // 2. 본격적인 게임 반복문 시작
    while (true) {
        const rawInput = prompt("1부터 50 사이의 숫자를 맞춰보세요!\n(취소를 누르면 게임이 종료됩니다)");

        // prompt()는 '취소' 버튼을 누르거나 창을 닫으면 정확히 null을 반환합니다.
        // 값으로 변환하기 전에 원본(rawInput)으로 취소 여부를 먼저 판별해야 정확합니다.
        if (rawInput === null) {
            alert("게임을 종료합니다. 다음에 다시 도전해 주세요!");
            return;
        }

        const userGuess = Number(rawInput);

        // 숫자가 아니거나(NaN) 1~50 범위를 벗어난 값은 '유효하지 않은 시도'로 처리하고
        // 시도 횟수(count)에 포함하지 않은 채 다시 입력을 받습니다.
        if (Number.isNaN(userGuess) || userGuess < 1 || userGuess > 50) {
            alert("⚠️ 1부터 50 사이의 숫자만 입력해 주세요.");
            continue;
        }

        count++;
        guessHistory.push(userGuess);

        if (userGuess === computerNum) {
            alert(`🎉 정답입니다! 축하합니다!\n👉 ${count}번 만에 맞추셨습니다.\n📝 입력 기록: ${guessHistory.join(", ")}`);
            break;

        } else if (userGuess > computerNum) {
            alert(`🔽 Down! 더 작은 숫자를 입력해 보세요. (현재 ${count}회 도전 중)`);

        } else {
            alert(`🔼 Up! 더 큰 숫자를 입력해 보세요. (현재 ${count}회 도전 중)`);
        }
    }

    // 3. 정답을 맞춰서 반복문을 빠져나온 경우에만 재도전 여부를 물어봅니다.
    const playAgain = confirm("한 판 더 도전하시겠습니까?");
    if (playAgain) {
        startGame();
    }
}