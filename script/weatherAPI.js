// [모듈 분리 버전 - 1] weatherAPI.js
// 이 파일은 외부에서 자유롭게 호출할 수 있도록 날씨 데이터 통신만 전담하는 순수 비동기 데이터 모듈입니다.

export async function getLiveWeather(lat, lon) {
    if (!lat || !lon) return null;
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
    
    try {
        const response = await fetch(url);
        
        // 서버 응답 상태 검증 방어벽 (교재 245페이지)
        if (!response.ok) {
            throw new Error(`서버 응답 불안정 (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        // API 결과 구조에 대한 안정성 검증
        if (!data || !data.current) {
            throw new Error("올바르지 않은 API 데이터 형식입니다.");
        }
        
        // 필요한 핵심 데이터만 깔끔한 객체로 패킹해서 리턴
        return {
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m
        };
    } catch (error) {
        console.error("API 모듈 에러:", error);
        return null; // 에러 발생 시 호출부에 null을 리턴하여 안전하게 예외처리 유도
    }
}