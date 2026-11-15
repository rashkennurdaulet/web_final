/* Current Astana conditions for visitors. Data by Open-Meteo. */
(function () {
  'use strict';

  const status = document.getElementById('weather-status');
  const tip = document.getElementById('weather-tip');
  const refresh = document.getElementById('weather-refresh');
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.17&longitude=71.43' +
    '&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FAlmaty&forecast_days=1';

  function describe(code) {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if ([45, 48].includes(code)) return 'Fog';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
    if ([95, 96, 99].includes(code)) return 'Thunderstorms';
    return 'Current conditions';
  }

  function visitTip(condition, temperature, wind) {
    if (condition === 'Thunderstorms' || wind >= 35) return 'Check the indoor exhibits if you are planning a visit.';
    if (condition === 'Rain' || condition === 'Drizzle') return 'Bring a rain jacket for the outdoor paths.';
    if (temperature < 5) return 'Dress warmly for the outdoor exhibits.';
    if (temperature >= 27) return 'Bring water and take breaks in the shade.';
    return 'See the zoo map for outdoor paths and indoor exhibits.';
  }

  async function loadWeather() {
    refresh.disabled = true;
    status.textContent = 'Loading current weather in Astana…';
    tip.hidden = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Weather service returned ' + response.status);
      const { current } = await response.json();
      const { temperature_2m: temperature, weather_code: code, wind_speed_10m: wind } = current || {};
      if (![temperature, code, wind].every(Number.isFinite)) throw new Error('Missing weather values');
      const condition = describe(code);
      status.textContent = 'Astana · ' + Math.round(temperature) + ' °C · ' + condition + ' · Wind ' + Math.round(wind) + ' km/h';
      tip.textContent = visitTip(condition, temperature, wind);
      tip.hidden = false;
      refresh.textContent = 'Refresh weather';
    } catch (error) {
      status.textContent = 'Astana weather is unavailable right now. Try again in a moment.';
      refresh.textContent = 'Retry weather';
    } finally {
      window.clearTimeout(timeout);
      refresh.disabled = false;
    }
  }

  refresh.addEventListener('click', loadWeather);
  loadWeather();
})();
