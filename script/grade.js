function checkGrade() {
    // 1. 과목명이 담긴 배열 (재할당하지 않으므로 const)
    const subjects = ["HTML", "CSS", "JavaScript"];   // 오타 수정: JavsScript -> JavaScript

    let total = 0;
    const scores = [];   // 과목별 점수를 따로 기록해 최종 결과표에 함께 보여줍니다

    for (let i = 0; i < subjects.length; i++) {
        const rawInput = prompt(`${subjects[i]} 점수를 입력해 주세요. (0 ~ 100)`);

        // prompt()를 취소하면 null이 반환됩니다. Number(null)은 0이라
        // isNaN()만으로는 취소 여부를 구분할 수 없어서, 원본값으로 먼저 확인합니다.
        if (rawInput === null) {
            alert("계산이 취소되었습니다.");
            return;
        }

        const score = Number(rawInput);

        // 숫자가 아니거나 0~100 범위를 벗어나면, 같은 과목을 다시 물어봅니다.
        if (Number.isNaN(score) || score < 0 || score > 100) {
            alert("⚠️ 0~100 사이의 숫자만 입력해 주세요.");
            i--;            // 인덱스를 되돌려서 이번 과목을 다시 입력받도록 함
            continue;
        }

        total += score;     // total = total + score 와 동일 (누적 대입 연산자)
        scores.push(score);
    }

    const average = total / subjects.length;

    // 평균 점수에 따라 합격/불합격 + 등급까지 함께 안내
    let result, grade;
    if (average >= 90) { result = "🎉 합격입니다! 우수자로 선정되었습니다."; grade = "A"; }
    else if (average >= 80) { result = "🎉 합격입니다!"; grade = "B"; }
    else if (average >= 70) { result = "🎉 합격입니다!"; grade = "C"; }
    else if (average >= 60) { result = "🎉 합격입니다!"; grade = "D"; }
    else { result = "❌ 불합격입니다. 다음 기회에 힘내세요!"; grade = "F"; }

    // 과목별 점수를 한눈에 볼 수 있는 상세 내역 (Array.map 활용)
    const detailLines = subjects
        .map((subject, i) => `  - ${subject}: ${scores[i]}점`)
        .join("\n");

    alert(
        `====== 📊 성적 결과표 ======\n` +
        `${detailLines}\n` +
        `---------------------------\n` +
        `• 총점: ${total}점\n` +
        `• 평균: ${average.toFixed(1)}점\n` +
        `• 등급: ${grade}\n` +
        `• 결과: ${result}`
    );
}