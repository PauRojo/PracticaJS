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
 

