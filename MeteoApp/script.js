// recupero i dati del giorno 1 dentro i main 
const contenitore = document.querySelector('.contenitore');
const logo = document.querySelector('.logo');
const allert = document.querySelector('#alert');
const search = document.querySelector('#search');
const todayIcon = document.querySelector('#todayIcon');
const todayDegrees = document.querySelector('#todayDegrees');
const arrow = document.querySelector('#arrow');
const iconNextWeather = document.querySelector('#iconNextWeather');
const humidity = document.querySelector('#humidity');
const windSpeed = document.querySelector('#windSpeed');
const pressure = document.querySelector('#pressure');
const city = document.querySelector('#city');
const detail = document.querySelector('#detail');
const temperature = document.querySelector('#temperature');
const nameCity = document.querySelector('#nameCity');
const cliccabile = document.querySelectorAll('.cliccabile');
// Recupero elementi della finestra con id windowCard
const windowIcon = document.querySelector('#windowIcon');
const windowDay = document.querySelector('#windowDay');
const windowMinMax = document.querySelector('#windowMinMax');
const windowWind = document.querySelector('#windowWind');
const windowUmidity = document.querySelector('#windowUmidity');
const windowProb = document.querySelector('#windowProb');
const windowTime = document.querySelector('#windowTime');


const API_KEY = '7f6afbe6b56a128156bf47a100250330';

// recupero posizione
navigator.geolocation.getCurrentPosition(onSuccess, onError);

function onError() {
    contenitore.style.display = 'none';
    allert.textContent = "Siete pregati di acconsentire l'accesso alla posizione per il corretto funzionamento della WebApp";
}



async function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=it`;
    const endpointForecast = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=16&appid=${API_KEY}&lang=it&units=metric`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        // Recupera i dati meteo
        const { name } = data;
        const iconCode = data.weather[0].icon;
        const iconDescription = capitalize(data.weather[0].description);
        const temperatureData = Math.floor(data.main.temp);
        const humidityData = data.main.humidity;
        const windData = Math.floor(data.wind.speed * 3.6);
        const windDirection = getWindDirection(data.wind.deg);
        const pressureData = data.main.pressure;
        const town = data.name;

        // Inserisco i dati meteo nel sito
        todayIcon.src = `icon/${iconCode}.svg`;
        todayIcon.alt = iconDescription;
        todayDegrees.innerHTML = `${temperatureData}°C`;
        humidity.innerHTML = `Umidità ${humidityData}%`;
        windSpeed.innerHTML = `Vento ${windData} km/h ${windDirection}`;
        pressure.innerHTML = `Pressione ${pressureData} hPa`;
        city.innerHTML = `${town}`;
        nameCity.innerHTML = `${town}`;
        detail.innerHTML = `${iconDescription}`;

        // Recupero e popolo i dati forecast
        await fetchAndPopulateForecast(endpointForecast);
    } catch (error) {
        contenitore.style.display = 'none';
        allert.textContent = 'Errore durante il caricamento dei dati';
    } finally {
        contenitore.style.display = 'block';
    }

}

// Recupera l'input di ricerca
search.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const cityName = search.value.trim();
        if (cityName) {
            await fetchWeatherByCity(cityName);
        }
    }
});

// Funzione per recuperare i dati meteo tramite il nome della città
async function fetchWeatherByCity(cityName) {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=it`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
            alert('città inserita inesistente o errata');
        }
        const data = await response.json();

        // Recupera i dati meteo
        var town = data.name;
        const iconCode = data.weather[0].icon;
        const iconDescription = capitalize(data.weather[0].description);
        const temperatureData = Math.floor(data.main.temp);
        const humidityData = data.main.humidity;
        const windData = Math.floor(data.wind.speed * 3.6);
        const windDirection = getWindDirection(data.wind.deg);
        const pressureData = data.main.pressure;
        const details = data.weather[0].main;

        // Aggiorna i dati nel DOM
        todayIcon.src = `icon/${iconCode}.svg`;
        todayIcon.alt = iconDescription;
        todayDegrees.innerHTML = `${temperatureData}°C`;
        humidity.innerHTML = `Humidity ${humidityData}%`;
        windSpeed.innerHTML = `Wind Speed ${windData} km/h ${windDirection}`;
        pressure.innerHTML = `Pressure ${pressureData} hPa`;
        city.innerHTML = `${town}`;
        detail.innerHTML = `${iconDescription}`;
        nameCity.innerHTML = `${town}`;

        // Recupera i dati del forecast a 4 giorni
        await fetchForecastByCity(cityName);
    } catch (error) {
        contenitore.style.display = 'none';
    }
}

// Funzione per recuperare i dati del forecast a 16 giorni
async function fetchForecastByCity(cityName) {
    const endpointForecast = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&cnt=16&appid=${API_KEY}&lang=it&units=metric`;
    await fetchAndPopulateForecast(endpointForecast);
}

// Funzione per recuperare i dati forecast e riempire la finestra windowCard
async function fetchAndPopulateForecast(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Errore nel recupero del forecast');
        }
        const dataForecast = await response.json();
        console.log(dataForecast);
        iconNextWeather.src = `icon/${dataForecast.list[0].weather[0].icon}.svg`;
        // Aggiorna le card cliccabili con i dati forecast
        for (let i = 0; i < 4; i++) {
            const titleDay = document.querySelector(`#day${i + 1}`);
            const titleDayData = dataForecast.list[i].dt;
            titleDay.textContent = formatDate(titleDayData);

            const iconDay = document.querySelector(`#day${i + 1}Icon`);
            const iconDayCode = dataForecast.list[i].weather[0].icon;
            iconDay.src = `icon/${iconDayCode}.svg`;

            const daysMin = Math.round(dataForecast.list[i].temp.min);
            const daysMax = Math.round(dataForecast.list[i].temp.max);
            const daysDegrees = document.querySelector(`#day${i + 1}Degrees`);
            daysDegrees.innerHTML = `${daysMax}°C / ${daysMin}°C`;
        }
        const tempMin = Math.floor(dataForecast.list[0].temp.min);
        const tempMax = Math.floor(dataForecast.list[0].temp.max);
        const nightTemp = Math.floor(dataForecast.list[0].temp.morn);
        temperature.innerHTML = `High ${tempMax}°C | Low ${tempMin}°C`;
        // Recupera il valore di temperatureData dal contesto appropriato
        const temperatureData = Math.floor(dataForecast.list[0].temp.day);

        if (temperatureData <= nightTemp) {
            arrow.src = "img/upArrow.png";
        } else {
            arrow.src = "img/downArrow.png";
        }
        for (var i = 0; i < 16; i++) {
            var titleDay = document.querySelector(`#tableDay${i + 1}`);
            var titleDayData = new Date(dataForecast.list[i].dt * 1000);
            var option = { weekday: 'long', day: 'numeric' }; // Definizione della variabile "option"
            titleDay.textContent = titleDayData.toLocaleDateString('it-IT', option);

            var iconDay = document.querySelector(`#tableIcon${i + 1}`);
            var iconDay1 = document.querySelector('#tableDay1');
            iconDay1.innerHTML = "Oggi";
            var iconDayCode = dataForecast.list[i].weather[0].icon;
            iconDay.src = `icon/${iconDayCode}.svg`;

            var daysMin = Math.floor(dataForecast.list[i].temp.min);
            var daysMax = Math.floor(dataForecast.list[i].temp.max);
            var daysDegrees = document.querySelector(`#tableMaxMin${i + 1}`);
            daysDegrees.innerHTML = `${daysMax}°C  ${daysMin}°C `;
        }

        // Aggiungi evento click per riempire la finestra windowCard
        cliccabile.forEach((card, index) => {
            card.addEventListener('click', () => {
                populateWindowCard(dataForecast.list[index]);
                const windowElement = document.querySelector('#windowCard');
                windowElement.style.display = 'block';
            });
        });

        // Aggiungi evento click per le righe della tabella
        for (let i = 0; i < 16; i++) {
            const tableRow = document.querySelector(`#tableDay${i + 1}`).parentElement;
            tableRow.addEventListener('click', () => {
                populateWindowCard(dataForecast.list[i]);
                const windowElement = document.querySelector('#windowCard');
                windowElement.style.display = 'block';
            });
        }
    } catch (error) {
        console.error('Errore durante il recupero del forecast:', error);
    }
}

function getWindDirection(degrees) {
    if (degrees < 40) return 'N';
    if (degrees < 80) return 'NE';
    if (degrees < 130) return 'E';
    if (degrees < 170) return 'SE';
    if (degrees < 220) return 'S';
    if (degrees < 260) return 'SW';
    if (degrees < 310) return 'W';
    return 'NW';
}

const capitalize = (str) => {
    if (!str) return ""; // Gestisce stringhe vuote o null
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Funzione per formattare la data
function formatDate(timestamp, locale = 'it-IT', options = { weekday: 'long', day: 'numeric' }) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(locale, options);
}


// Aggiungi evento click alle card cliccabili
cliccabile.forEach(card => {
    card.addEventListener('click', () => {

        // Mostra la finestra con id windowCard
        const windowElement = document.querySelector('#windowCard');

        windowElement.style.display = 'block';
    });
});

// Aggiungi evento per chiudere la finestra
const closeButton = document.querySelector('#windowCard button');
closeButton.addEventListener('click', () => {
    const windowElement = document.querySelector('#windowCard');
    windowElement.style.display = 'none';
});

// Funzione per riempire la finestra con i dati forecast
function populateWindowCard(data) {
    const { dt, sunrise, sunset, temp, humidity, weather, pop } = data;

    // Formatta la data e l'ora
    const formattedDate = formatDate(dt);
    const formattedSunrise = new Date(sunrise * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const formattedSunset = new Date(sunset * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    // Aggiorna gli elementi della finestra
    windowDay.textContent = formattedDate;
    windowIcon.src = `icon/${weather[0].icon}.svg`;
    windowIcon.alt = weather[0].description;
    windowMinMax.textContent = `High ${Math.round(temp.max)}°C / Low ${Math.round(temp.min)}°C`;
    windowWind.innerHTML = `<img src="img/vento.png" alt="">Vento: ${data.speed} km/h`;
    windowUmidity.innerHTML = `<img src="img/goccia.png" alt="">Umidità: ${humidity}%`;
    windowProb.innerHTML = `<img src="img/nuvola.png" alt="">Prob. Pioggia: ${Math.round(pop * 100)}%`;
    windowTime.innerHTML = `<img src="img/soleggiato.png" alt="">Alba: ${formattedSunrise} | Tramonto: ${formattedSunset}`;
}

// Modifica l'evento click per le card cliccabili
cliccabile.forEach((card, index) => {
    card.addEventListener('click', async () => {
        try {
            // Recupera il nome della città dal DOM
            const cityName = document.querySelector('#city').textContent.trim();

            // Recupera i dati forecast per il giorno selezionato
            const endpointForecastWindow = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&cnt=16&appid=${API_KEY}&lang=it&units=metric`;
            const responseWindow = await fetch(endpointForecastWindow);
            if (!responseWindow.ok) {
                throw new Error('Errore nel recupero dei dati forecast per la finestra');
            }
            const forecastDataWindow = await responseWindow.json();

            // Popola la finestra con i dati del giorno selezionato
            populateWindowCard(forecastDataWindow.list[index + 1]);

            // Mostra la finestra
            const windowElement = document.querySelector('#windowCard');
            windowElement.style.display = 'block';
        } catch (error) {
            console.error('Errore durante il recupero dei dati forecast:', error);
        }
    });
});






