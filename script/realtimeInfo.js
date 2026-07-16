// [모듈 분리 버전 - 2] realtimeInfo.js
// 이 파일은 화면의 UI 변경, 타이머, 사용자의 인터랙션 이벤트를 전담하는 파일입니다.
// 인라인 스타일을 배제하고 style.css의 클래스 선택자와 반응형 디자인을 호환합니다.

import { getLiveWeather } from './weatherAPI.js';

const citySelect = document.querySelector('#city-select');
const weatherBox = document.querySelector('#weather-box');

// Timer API(setInterval)를 관리하기 위한 전역 변수
let autoRefreshTimerId = null;
// API 호출이 전송 중일 때 중복 연타 호출을 방지하기 위한 상태 플래그
let isFetching = false;

document.addEventListener('DOMContentLoaded', () => {
    // Storage API: 페이지 첫 진입 시 마지막 선택 도시 불러오기 (교재 256페이지)
    const savedCity = localStorage.getItem('lastSelectedCity');
    if (savedCity && savedCity !== "none") {
        citySelect.value = savedCity;
        updateWeather(); // 저장된 도시로 날씨 업데이트 자동 실행
    }
});

async function updateWeather() {
    const selectedValue = citySelect.value;
    
    // 네트워크 통신 중 중복 호출이 들어오면 함수를 즉시 종료하여 자원 낭비 방지 (API Guard)
    if (isFetching) return;

    // 새로운 도시를 선택하거나 갱신할 때 기존 백그라운드 타이머 초기화 (메모리 관리 - 교재 255페이지)
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

    // 구조 분해 할당(Destructuring)으로 위도/경도 바인딩
    const [lat, lon] = selectedValue.split(',');
    const cityName = citySelect.options[citySelect.selectedIndex].text;

    // 대기 상태 디자인 (style.css 클래스 기반 매핑)
    weatherBox.innerHTML = `
        <div class="section-box">
            <h3>📡 실시간 기상 데이터 수신 중...</h3>
            <progress max="100" style="width: 100%;"></progress>
        </div>
    `;

    // 비동기 처리 시작 지점에 플래그 활성화
    isFetching = true;
    const weatherInfo = await getLiveWeather(lat, lon);
    isFetching = false; // 수신 종료 후 플래그 비활성화

    if (weatherInfo) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { hour12: true });

        // 첫 카드 렌더링
        renderWeatherCard(cityName, weatherInfo.temp, weatherInfo.humidity, timeString);

        // Timer API 적용: 60초 백그라운드 자동 루프 가동
        autoRefreshTimerId = setInterval(async () => {
            console.log(`[Auto-Refresh] ${cityName} 날씨 정보를 자동으로 갱신합니다.`);
            
            // 우측 하단 배지 상태를 "갱신 중"으로 부드럽게 변경
            const statusBadge = weatherBox.querySelector('#update-status');
            if (statusBadge) {
                statusBadge.textContent = "🔄 갱신 중...";
                statusBadge.setAttribute('data-status', '예정'); // style.css의 '예정' 테마 색상 자동 변환
            }

            const refreshedInfo = await getLiveWeather(lat, lon);
            
            if (refreshedInfo) {
                const refreshedTime = new Date().toLocaleTimeString('ko-KR', { hour12: true });
                
                // DOM 일부분만 교체하여 화면 깜빡임 차단 (Reflow 최소화 기법)
                const tempElement = weatherBox.querySelector('#current-temp');
                const humidityElement = weatherBox.querySelector('#current-humidity');
                const timeElement = weatherBox.querySelector('#update-time');
                
                if (tempElement) tempElement.textContent = refreshedInfo.temp;
                if (humidityElement) humidityElement.textContent = refreshedInfo.humidity;
                if (timeElement) timeElement.textContent = refreshedTime;
                
                if (statusBadge) {
                    statusBadge.textContent = "60초 주기 자동 갱신";
                    statusBadge.setAttribute('data-status', '완료'); // style.css의 '완료' 테마 색상 복구
                }
            } else {
                // 백그라운드 갱신 실패 시 기존 카드를 날리지 않고 상태 표시 배지만 경고 처리 (뛰어난 안정성 확보)
                if (statusBadge) {
                    statusBadge.textContent = "⚠️ 자동 갱신 실패";
                    statusBadge.setAttribute('data-status', '예정');
                }
            }
        }, 60000);

    } else {
        // 네트워크 장애 방어 UI 설계 (인라인 스타일 없는 완벽한 클래스 기반 UI 구현)
        weatherBox.innerHTML = `
            <div class="section-box">
                <h3>⚠️ 데이터 수신에 실패했습니다.</h3>
                <p>네트워크 연결 상태를 확인하고 다시 시도해 주세요.</p>
                <button id="btn-retry" class="btn-submit">다시 시도</button>
            </div>
        `;
    }
}

// 템플릿 리터럴을 활용하고, 인라인 스타일을 완전히 배제한 날씨 카드 렌더러
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

// 이벤트 감지 영역 및 위임 처리
citySelect.addEventListener('change', updateWeather);

// ★ 교재 244페이지 "이벤트 위임(Event Delegation)" 구현
// weatherBox 내에 동적으로 생성되는 모든 버튼 클릭을 한 번에 가로채어 깔끔하게 실행시킵니다.
weatherBox.addEventListener('click', (event) => {
    const retryBtn = event.target.id === 'btn-retry';
    const refreshBtn = event.target.closest('#btn-refresh');

    if (retryBtn || refreshBtn) {
        console.log("[Event Delegation] 동적 버튼 클릭이 부모 위임기를 통해 성공적으로 감지되었습니다.");
        updateWeather(); // 날씨 갱신 함수 실행
    }
});