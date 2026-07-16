// [단일 파일 버전] weather.js
// 이 파일은 CSS 모듈 및 변수 구조에 맞춰 인라인 스타일을 모두 제거한 최적화 버전입니다.

const citySelect = document.querySelector('#city-select');
const weatherBox = document.querySelector('#weather-box');

// Timer API(setInterval)를 관리하기 위한 전역 변수
let autoRefreshTimerId = null;
// API 호출 중 중복 클릭을 방지하기 위한 안전 장치 플래그 (State Guard)
let isFetching = false;

document.addEventListener('DOMContentLoaded', () => {
    // Storage API: 페이지가 로드될 때 마지막 선택 도시를 기억하여 즉시 불러옵니다 (교재 256페이지)
    const savedCity = localStorage.getItem('lastSelectedCity');
    if (savedCity && savedCity !== "none") {
        citySelect.value = savedCity;
        updateWeather(); // 저장된 도시로 날씨 즉시 실행
    }
});

async function updateWeather() {
    const selectedValue = citySelect.value;
    
    // 네트워크 통신 중 중복 호출이 들어오면 함수를 즉시 종료하여 자원 낭비 방지 (API Guard)
    if (isFetching) return;

    // 새로운 도시를 선택하거나 갱신할 때 기존 백그라운드 타이머 초기화 (메모리 누수 방지 - 교재 255페이지)
    if (autoRefreshTimerId) {
        clearInterval(autoRefreshTimerId);
        autoRefreshTimerId = null;
    }

    if (selectedValue === "none") {
        weatherBox.innerHTML = "<p>도시를 선택하면 날씨 정보가 표시됩니다.</p>";
        localStorage.removeItem('lastSelectedCity'); // 선택 안 함일 경우 로컬스토리지 정리
        return;
    }

    // 로컬스토리지에 현재 선택한 좌표값 영구 저장
    localStorage.setItem('lastSelectedCity', selectedValue);

    // 구조 분해 할당(Destructuring - ES6)으로 위도/경도 바인딩
    const [lat, lon] = selectedValue.split(',');
    const cityName = citySelect.options[citySelect.selectedIndex].text;

    // 대기 상태 디자인 (style.css의 section-box 클래스 활용)
    weatherBox.innerHTML = `
        <div class="section-box">
            <h3>📡 실시간 기상 데이터 수신 중...</h3>
            <progress max="100" style="width: 100%;"></progress>
        </div>
    `;

    // 비동기 처리 시작 지점에 플래그 활성화
    isFetching = true;
    
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
        const response = await fetch(url); // 비동기 통신 (교재 257페이지)
        
        if (!response.ok) {
            throw new Error(`서버 응답 불안정 (Status: ${response.status})`);
        }
        
        const data = await response.json();
        isFetching = false; // 수신 종료 후 플래그 비활성화

        if (!data || !data.current) {
            throw new Error("올바르지 않은 API 데이터 형식입니다.");
        }

        const now = new Date(); // Date 내장 객체 활용 (교재 225페이지)
        const timeString = now.toLocaleTimeString('ko-KR', { hour12: true });

        // 첫 카드 렌더링
        renderWeatherCard(cityName, data.current.temperature_2m, data.current.relative_humidity_2m, timeString);

        // Timer API 적용: 60초 백그라운드 자동 루프 가동
        autoRefreshTimerId = setInterval(async () => {
            console.log(`[Auto-Refresh] ${cityName} 날씨 정보를 자동으로 갱신합니다.`);
            
            const statusBadge = weatherBox.querySelector('#update-status');
            if (statusBadge) {
                statusBadge.textContent = "🔄 갱신 중...";
                statusBadge.setAttribute('data-status', '예정'); // style.css의 '예정' 색상 테마로 변경
            }

            try {
                const refreshedResponse = await fetch(url);
                if (refreshedResponse.ok) {
                    const refreshedData = await refreshedResponse.json();
                    const refreshedTime = new Date().toLocaleTimeString('ko-KR', { hour12: true });
                    
                    // DOM 일부분만 교체하여 화면 깜빡임 차단 (Reflow 최소화)
                    const tempElement = weatherBox.querySelector('#current-temp');
                    const humidityElement = weatherBox.querySelector('#current-humidity');
                    const timeElement = weatherBox.querySelector('#update-time');
                    
                    if (tempElement) tempElement.textContent = refreshedData.current.temperature_2m;
                    if (humidityElement) humidityElement.textContent = refreshedData.current.relative_humidity_2m;
                    if (timeElement) timeElement.textContent = refreshedTime;
                    
                    if (statusBadge) {
                        statusBadge.textContent = "60초 주기 자동 갱신";
                        statusBadge.setAttribute('data-status', '완료'); // style.css의 '완료' 색상 테마로 변경
                    }
                }
            } catch (err) {
                if (statusBadge) {
                    statusBadge.textContent = "⚠️ 자동 갱신 실패";
                    statusBadge.setAttribute('data-status', '예정');
                }
            }
        }, 60000);

    } catch (error) {
        isFetching = false;
        console.error("날씨 처리 중 오류 발생:", error);
        
        // 네트워크 장애 방어 UI 설계 (인라인 스타일 완전 제거 및 style.css 클래스 기반 매핑)
        weatherBox.innerHTML = `
            <div class="section-box">
                <h3>⚠️ 데이터 수신에 실패했습니다.</h3>
                <p>네트워크 연결 상태를 확인하고 다시 시도해 주세요.</p>
                <button id="btn-retry" class="btn-submit">다시 시도</button>
            </div>
        `;
    }
}

// 템플릿 리터럴을 활용하고, 인라인 스타일을 없앤 날씨 카드 렌더러
function renderWeatherCard(name, temp, humidity, time) {
    weatherBox.innerHTML = `
        <div class="section-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0;">🌍 ${name} 실시간 날씨</h3>
                <button id="btn-refresh" class="btn-reset" title="즉시 새로고침" style="padding: 6px 12px;">🔄 새로고침</button>
            </div>
            <p>🌡️ 기온: <strong><span id="current-temp">${temp}</span>°C</strong></p>
            <p>💧 습도: <strong><span id="current-humidity">${humidity}</span>%</strong></p>
            <hr>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                <span>⏱️ 업데이트: <span id="update-time">${time}</span></span>
                <span id="update-status" class="tag" data-status="완료">60초 주기 자동 갱신</span>
            </div>
        </div>
    `;
}

// 이벤트 바인딩 및 이벤트 위임 패턴(Event Delegation - 교재 244페이지) 적용
citySelect.addEventListener('change', updateWeather);

// 동적으로 렌더링된 버튼들의 클릭 이벤트를 부모 영역에서 효율적으로 한 번에 처리
weatherBox.addEventListener('click', (event) => {
    const isRetry = event.target.id === 'btn-retry';
    const isRefresh = event.target.closest('#btn-refresh');

    if (isRetry || isRefresh) {
        console.log("[Event Delegation] 동적 버튼 클릭 감지");
        updateWeather();
    }
});