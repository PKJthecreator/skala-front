function showMyBag() {
    // 1. 소지품 객체가 담긴 배열 (재할당하지 않으므로 const)
    const myBag = [
        { name: "여권 ✈️", count: 1 },
        { name: "스마트폰 📱", count: 2 },
        { name: "지갑 💳", count: 1 }
    ];

    let resultText = "🎒 [내 가방 속 물품 목록]\n-----------------------\n";
    let totalCount = 0;   // 물품 총 수량도 함께 집계

    // for...in은 '객체'의 속성(key)을 순회할 때 쓰는 문법이고,
    // myBag처럼 '배열'을 순회할 때는 for...of가 더 정확하고 안전합니다.
    // (for...in은 배열 인덱스를 문자열로 반환하고, 상속된 속성까지 순회할 위험이 있습니다)
    for (const item of myBag) {
        resultText += `- ${item.name} : ${item.count}개\n`;
        totalCount += item.count;
    }

    resultText += "-----------------------\n";
    resultText += `물품 종류: ${myBag.length}가지\n`;
    resultText += `총 수량: ${totalCount}개`;

    alert(resultText);
}