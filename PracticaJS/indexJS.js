const cities = {
  barcelona: {
    name: "Barcelona",
    country: "Espanya",
    lat: 41.3888,
    lng: 2.159,
    currency: "EUR",
    flag: "🇪🇸"
  },
  tokyo: {
    name: "Tòquio",
    country: "Japó",
    lat: 35.6895,
    lng: 139.6917,
    currency: "JPY",
    flag: "🇯🇵"
  },
  newyork: {
    name: "Nova York",
    country: "EUA",
    lat: 40.7128,
    lng: -74.006,
    currency: "USD",
    flag: "🇺🇸"
  },
  london: {
    name: "Londres",
    country: "Regne Unit",
    lat: 51.5074,
    lng: -0.1278,
    currency: "GBP",
    flag: "🇬🇧"
  },
  paris: {
    name: "París",
    country: "França",
    lat: 48.8566,
    lng: 2.3522,
    currency: "EUR",
    flag: "🇫🇷"
  },
  dubai: {
    name: "Dubai",
    country: "Emirats Àrabs",
    lat: 25.2048,
    lng: 55.2708,
    currency: "AED",
    flag: "🇦🇪"
  },
  sydney: {
    name: "Sydney",
    country: "Austràlia",
    lat: -33.8688,
    lng: 151.2093,
    currency: "AUD",
    flag: "🇦🇺"
  },
  mexico: {
    name: "Ciutat de Mèxic",
    country: "Mèxic",
    lat: 19.4326,
    lng: -99.1332,
    currency: "MXN",
    flag: "🇲🇽"
  }
};


// 2. ESTAT GLOBAL DE L'APLICACIÓ

let currentCity = null;       // Objecte de la ciutat seleccionada
let exchangeRate = null;      // Tipus de canvi EUR → moneda local
 

// 3. REFERENCIES AL DOM

const citySelect        = document.getElementById("citySelect");
const dashboardContent  = document.getElementById("dashboardContent");
const placeholder       = document.getElementById("placeholder");
 
// Hero card
const heroCity     = document.getElementById("heroCity");
const heroCountry  = document.getElementById("heroCountry");
const heroTemp     = document.getElementById("heroTemp");
const heroCurrency = document.getElementById("heroCurrency");
const heroCoords   = document.getElementById("heroCoords");
 
// Meteorologia
const weatherLoading = document.getElementById("weatherLoading");
const weatherData    = document.getElementById("weatherData");
const weatherError   = document.getElementById("weatherError");
const weatherIcon    = document.getElementById("weatherIcon");
const weatherTemp    = document.getElementById("weatherTemp");
const weatherDesc    = document.getElementById("weatherDesc");
const weatherHumidity= document.getElementById("weatherHumidity");
const weatherWind    = document.getElementById("weatherWind");
const weatherFeels   = document.getElementById("weatherFeels");
const rainPct        = document.getElementById("rainPct");
const rainBarFill    = document.getElementById("rainBarFill");
const rainLabel      = document.getElementById("rainLabel");
 
// Divises
const currencyLoading     = document.getElementById("currencyLoading");
const currencyData        = document.getElementById("currencyData");
const currencyError       = document.getElementById("currencyError");
const rateDisplay         = document.getElementById("rateDisplay");
const eurAmount           = document.getElementById("eurAmount");
const resultFlag          = document.getElementById("resultFlag");
const convertedAmount     = document.getElementById("convertedAmount");
const targetCurrencyCode  = document.getElementById("targetCurrencyCode");
const conversionSummary   = document.getElementById("conversionSummary");
 

// 4. INICIALITZAR EL SELECTOR DE CIUTATS

function initSelector() {
  Object.entries(cities).forEach(([key, city]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${city.flag}  ${city.name} — ${city.country}`;
    citySelect.appendChild(option);
  });
}
 
// 5. EVENT: canvi de ciutat

citySelect.addEventListener("change", function () {
  const key = this.value;
 
  if (!key) {
    // Cap ciutat seleccionada → mostrar placeholder
    dashboardContent.classList.add("hidden");
    placeholder.classList.remove("hidden");
    currentCity = null;
    return;
  }
 
  currentCity = cities[key];
 
  // Mostrar dashboard i amagar placeholder
  placeholder.classList.add("hidden");
  dashboardContent.classList.remove("hidden");
 
  // Reset del camp de quantitat
  eurAmount.value = "";
  convertedAmount.textContent = "0.00";
  conversionSummary.textContent = "Introdueix una quantitat per convertir";
 
  // Actualitzar hero card (excepte temperatura, que ve de la API)
  updateHeroCard();
 
  // Carregar dades de les APIs
  fetchWeather(currentCity);
  fetchExchangeRate(currentCity.currency);
});
 
// 6. ACTUALITZAR CARD HERO

function updateHeroCard() {
  const city = currentCity;
  heroCity.textContent    = city.name;
  heroCountry.textContent = city.country;
  heroCurrency.textContent = city.currency;
  heroTemp.textContent    = "—";  // S'actualitza quan arriben les dades meteo
  heroCoords.textContent  = `${city.lat.toFixed(2)}°N, ${city.lng.toFixed(2)}°E`;
}


// 7. API METEOROLOGIA — Open-Meteo (gratuïta, sense API key)

async function fetchWeather(city) {
  // Mostrar estat de càrrega
  weatherLoading.classList.remove("hidden");
  weatherData.classList.add("hidden");
  weatherError.classList.add("hidden");
 
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${city.lat}&longitude=${city.lng}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&hourly=precipitation_probability` +
    `&timezone=auto&forecast_days=1`;
 
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
 
    const data = await response.json();
    displayWeather(data);
 
  } catch (error) {
    console.error("Error meteorologia:", error);
    weatherLoading.classList.add("hidden");
    weatherError.classList.remove("hidden");
  }
}
 
// ---- Processar i mostrar dades meteorològiques ----
function displayWeather(data) {
  const current = data.current;
 
  // Temperatura actual
  const temp = Math.round(current.temperature_2m);
 
  // Probabilitat de pluja: agafem el valor màxim de les properes hores
  const precipProb = data.hourly.precipitation_probability;
  // Agafem la màxima de les properes 12 hores
  const maxRainProb = Math.max(...precipProb.slice(0, 12));
 
  // Temperatura sensació
  const feelsLike = Math.round(current.apparent_temperature);
 
  // Humitat
  const humidity = current.relative_humidity_2m;
 
  // Vent
  const wind = Math.round(current.wind_speed_10m);
 
  // Icona i descripció del temps (WMO weather codes)
  const { icon, description } = getWeatherInfo(current.weather_code);
 
 // ---- Actualitzar DOM ----
  weatherIcon.textContent     = icon;
  weatherTemp.textContent     = `${temp}°C`;
  weatherDesc.textContent     = description;
  weatherHumidity.textContent = `${humidity}%`;
  weatherWind.textContent     = `${wind} km/h`;
  weatherFeels.textContent    = `${feelsLike}°C`;
 
  // Actualitzar hero card temperatura
  heroTemp.textContent = temp;
 
  // ---- Probabilitat de pluja ----
  rainPct.textContent = `${maxRainProb}%`;
  rainBarFill.style.width = `${maxRainProb}%`;
 
  // Establir color de la barra i text descriptiu
  const rainInfo = getRainInfo(maxRainProb);
  rainLabel.textContent  = rainInfo.text;
  rainLabel.className    = `rain-label ${rainInfo.cssClass}`;
 
  // Color de la barra de pluja
  if (maxRainProb < 20) {
    rainBarFill.style.background = "linear-gradient(90deg, #3ecf8e, #6eedb7)";
  } else if (maxRainProb < 50) {
    rainBarFill.style.background = "linear-gradient(90deg, #f7c94f, #fbbf24)";
  } else {
    rainBarFill.style.background = "linear-gradient(90deg, #4f8ef7, #a78bfa)";
  }


  // Mostrar dades
  weatherLoading.classList.add("hidden");
  weatherData.classList.remove("hidden");
}
 
// ---- Classificació de la pluja ----
function getRainInfo(probability) {
  if (probability < 20) {
    return { text: "✓ Sense pluja prevista", cssClass: "no-rain" };
  } else if (probability < 50) {
    return { text: "⚠ Possible pluja", cssClass: "possible" };
  } else {
    return { text: "☔ Probable pluja", cssClass: "probable" };
  }
}
 
// ---- Icones i descripcions WMO ----
function getWeatherInfo(code) {
  const weatherCodes = {
    0:  { icon: "☀️",  description: "Cel clar" },
    1:  { icon: "🌤️", description: "Principalment clar" },
    2:  { icon: "⛅",  description: "Parcialment ennuvolat" },
    3:  { icon: "☁️",  description: "Ennuvolat" },
    45: { icon: "🌫️", description: "Boira" },
    48: { icon: "🌫️", description: "Boira amb gebrada" },
    51: { icon: "🌦️", description: "Plugim lleu" },
    53: { icon: "🌦️", description: "Plugim moderat" },
    55: { icon: "🌧️", description: "Plugim intens" },
    61: { icon: "🌧️", description: "Pluja lleu" },
    63: { icon: "🌧️", description: "Pluja moderada" },
    65: { icon: "🌧️", description: "Pluja intensa" },
    71: { icon: "🌨️", description: "Neu lleu" },
    73: { icon: "❄️",  description: "Neu moderada" },
    75: { icon: "❄️",  description: "Neu intensa" },
    77: { icon: "🌨️", description: "Granissol" },
    80: { icon: "🌦️", description: "Ruixats lleus" },
    81: { icon: "🌧️", description: "Ruixats moderats" },
    82: { icon: "⛈️",  description: "Ruixats violents" },
    85: { icon: "🌨️", description: "Ruixats de neu" },
    95: { icon: "⛈️",  description: "Tempesta" },
    96: { icon: "⛈️",  description: "Tempesta amb calamarsa" },
    99: { icon: "⛈️",  description: "Tempesta intensa amb calamarsa" }
  };
 
  return weatherCodes[code] || { icon: "🌡️", description: `Codi ${code}` };
}

// 8. API DIVISES — Frankfurter (gratuïta, sense API key)

async function fetchExchangeRate(targetCurrency) {
  // Reset estats
  currencyLoading.classList.remove("hidden");
  currencyData.classList.add("hidden");
  currencyError.classList.add("hidden");
  exchangeRate = null;
 
  // Si la moneda destí és EUR, no cal fer fetch
  if (targetCurrency === "EUR") {
    exchangeRate = 1;
    displayCurrencyData(targetCurrency, 1);
    return;
  }
 
  const url = `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${targetCurrency}`;
 
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
 
    const data = await response.json();
    const rate = data.rates[targetCurrency];
 
    if (!rate) throw new Error("Moneda no trobada");
 
    exchangeRate = rate;
    displayCurrencyData(targetCurrency, rate);
 
  } catch (error) {
    console.error("Error divises:", error);
    currencyLoading.classList.add("hidden");
    currencyError.classList.remove("hidden");
  }
}
 
// ---- Mostrar widget de divises ----
function displayCurrencyData(currency, rate) {
  // Taxa de canvi
  if (currency === "EUR") {
    rateDisplay.textContent = "1 EUR = 1 EUR";
  } else {
    rateDisplay.textContent = `1 EUR = ${rate.toFixed(4)} ${currency}`;
  }
 
  // Bandera i codi de moneda al resultat
  resultFlag.textContent          = currentCity.flag;
  targetCurrencyCode.textContent  = currency;
 
  // Mostrar widget
  currencyLoading.classList.add("hidden");
  currencyData.classList.remove("hidden");
 
  // Si hi havia una quantitat introduïda, recalcular
  if (eurAmount.value) convertCurrency();
}
 




initSelector();