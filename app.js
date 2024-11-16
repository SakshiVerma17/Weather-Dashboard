const apiKey = 'bf1919647c055e6cc0d9b3f7b1ba03be';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const currentWeather = document.getElementById('currentWeather');
const cityDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature');
const wind = document.getElementById('windSpeed');
const humidity = document.getElementById('humidityLevel');
const weatherIcon = document.getElementById('weatherImage');
const weatherDescription = document.getElementById('weatherDescription');
const forecast = document.getElementById('forecast');
const recentCities = document.getElementById('recentCities');

async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        
        // Call the function to display current weather
        displayCurrentWeather(data);

        // Call the function to display the 5-day forecast
        fetchForecast(data.coord.lat, data.coord.lon);
        
        // Store the city in the local storage
        storeRecentCity(city);
    } catch (error) {
        alert(error.message);  // Show error if city is not found
    }
}


// Fetch 5-day forecast data based on latitude and longitude
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error(error);
    }
}

function displayCurrentWeather(data) {
    const date = new Date().toLocaleDateString();
    cityDate.textContent = `${data.name} (${date})`;
    temperature.textContent = `${data.main.temp} °C`;
    wind.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity}%`;
    
    console.log(data.weather[0].icon);
    // Get the icon code from the weather data and pass it to setWeatherIcon
    setWeatherIcon(data.weather[0].icon);  // This line is key to showing the icon
}


function setWeatherIcon(iconCode) {
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;  // Dynamically create the icon URL
    weatherIcon.src = iconUrl;  // Update the icon image source
}



// Set forecast icon ][based on humidity
function setForecastIcon(humidity) {
    if (humidity < 50) {
        return 'IMAGES/SUNNY.JPG';  // Replace with appropriate path
    } else if (humidity < 75) {
        return 'IMAGES/CLOUDY.JPEG';  // Replace with appropriate path
    } else if (humidity < 85) {
        return 'IMAGES/RAINY.JPEG';  // Replace with appropriate path
    } else {
        return 'IMAGES/HEAVY RAIN .JPEG';  // Replace with appropriate path
    }
}


// Display 5-day forecast
function displayForecast(data) {
    forecast.innerHTML = ''; // Clear previous forecast
    const dailyData = data.list.filter((entry, index) => index % 8 === 0); // Filter to get 1 reading per day

    dailyData.forEach((day, index) => {
        const forecastBox = document.createElement('div');
        forecastBox.classList.add('p-4', 'bg-blue-600', 'rounded-lg', 'text-center');
        forecastBox.style.width = '120px';
        forecastBox.innerHTML = `
            <h3 class="font-bold">${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <img src="IMAGES\SUNNY.JPEG" alt="Weather Icon" class="w-16 h-16 mx-auto">
            <p>${day.main.temp} °C</p>
            <p>${day.weather[0].description}</p>
        `;
        forecast.appendChild(forecastBox);
    });
}



// Store recent city search
function storeRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        if (cities.length > 3) cities.shift(); // Limit to 3 recent cities
        localStorage.setItem('recentCities', JSON.stringify(cities));
        displayRecentCities(cities);
    }
}


function displayRecentCities(cities) {
    recentCities.innerHTML = cities.map(city => `
        <button class="bg-cyan-700 rounded-md p-2 mt-2 w-full text-center">${city}</button>
    `).join('');

    // Add click event for each recent city
    recentCities.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            fetchWeather(button.textContent);
        });
    });
}


// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});


window.addEventListener('DOMContentLoaded', () => {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    displayRecentCities(cities);
});



locationBtn.addEventListener('click', () => {
    locationBtn.disabled = true;
    locationBtn.textContent = "Fetching location...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoordinates(lat, lon); // Calls the function to fetch weather for the location
            locationBtn.disabled = false;
            locationBtn.textContent = "Use Current Location";
        });
    } else {
        alert('Geolocation is not supported by this browser.');
        locationBtn.disabled = false;
        locationBtn.textContent = "Use Current Location";
    }
});

function fetchWeatherByCoordinates(lat, lon) {
    fetchForecast(lat, lon);  // Fetches forecast for coordinates
    fetchWeatherByCity(lat, lon);  // Fetches current weather by coordinates (optional)
}


function displayForecast(data) {
    forecast.innerHTML = ''; // Clear previous forecast
    const dailyData = data.list.filter((entry, index) => index % 8 === 0); // Filter to get 1 reading per day

    dailyData.forEach((day) => {
        // Extract the weather icon code from the data
        const iconCode = day.weather[0].icon;
        console.log('Icon Code:', iconCode); // Check the value of the icon code
        
        // Construct the URL for the weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        console.log('Icon URL:', iconUrl); // Check the generated icon URL

        // Create a div to hold the forecast data
        const forecastBox = document.createElement('div');
        forecastBox.classList.add('p-4', 'bg-gray-300', 'rounded-lg', 'text-center');
        forecastBox.style.width = '120px';

        // Create an image element for the weather icon
        const imgElement = document.createElement('img');
        imgElement.src = iconUrl;
        imgElement.alt = "Weather Icon";
        imgElement.classList.add('w-16', 'h-16', 'mx-auto');

        // If the image fails to load, show a fallback image (this is specifically for icons that fail to load)
        imgElement.onerror = () => {
            console.log('Image failed to load for ' + iconCode + '. Using fallback image.');
            imgElement.src = 'images/fallback.png'; // Provide a fallback image URL here
        };

        // Add the date, icon, and temperature description to the forecast box
        forecastBox.innerHTML = `
            <h3 class="font-bold">${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <p>${day.main.temp} °C</p>
            <p>Humidity: ${day.main.humidity}%</p>
            <p>Wind: ${day.wind.speed} m/s</p>
        `;
        
        // Append the weather icon image element separately to allow fallback handling
        forecastBox.appendChild(imgElement);

        // Add the forecast box to the forecast section
        forecast.appendChild(forecastBox);
    });
}


// Function to display recent cities
function displayRecentCities(cities) {
    recentCities.innerHTML = cities.map((city, index) => `
        <div class="flex justify-between items-center mb-2">
            <button class="bg-cyan-700 rounded-md p-2 w-full text-center" onclick="fetchWeather('${city}')">${city}</button>
            <button class="bg-red-500 text-white rounded-md p-1 ml-2" onclick="deleteCity(${index})">Delete</button>
        </div>
    `).join('');
}

// Function to delete a city
function deleteCity(index) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    // Remove the city at the provided index
    cities.splice(index, 1);
    
    // Save the updated cities list to localStorage
    localStorage.setItem('recentCities', JSON.stringify(cities));
    
    // Display the updated list
    displayRecentCities(cities);
}

// Event listener for loading recent cities on page load
window.addEventListener('DOMContentLoaded', () => {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    displayRecentCities(cities); // Display the most recent cities
});



// Event listener for the Search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

// Event listener for pressing the Enter key in the input field
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});



function displayForecast(data) {
    forecast.innerHTML = ''; // Clear previous forecast
    const dailyData = data.list.filter((entry, index) => index % 8 === 0); // Filter to get 1 reading per day

    dailyData.forEach((day) => {
        // Create a div to hold the forecast data
        const forecastBox = document.createElement('div');
        forecastBox.classList.add('p-4', 'bg-blue-600', 'rounded-sm', 'text-center');
        forecastBox.style.backgroundColor = '#5b6a8d';
        forecastBox.style.color = 'white';
        forecastBox.style.width = '120px';
        forecastBox.style.height = '250px';
        forecastBox.style.margin = '2px';
        forecastBox.style.border = '1px solid black';  // Applying the border dynamically

        // Extract the weather icon code from the data
        const iconCode = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        // Create an image element for the weather icon
        const imgElement = document.createElement('img');
        imgElement.src = iconUrl;
        imgElement.alt = "Weather Icon";
        imgElement.classList.add('w-16', 'h-16', 'mx-auto');

        // Add the date, icon, and temperature description to the forecast box
        forecastBox.innerHTML = `
            <h3 class="font-bold" style="text-decoration:underline; ">${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <p style=" font-size: 13px; font-weight:400; marrgin-top:1px;" >Temp:${day.main.temp} °C</p>
            <p  style=" font-size: 13px; font-weight:500;" >Humidity: ${day.main.humidity}%</p>
            <p  style=" font-size: 13px; font-weight:400;" >Wind: ${day.wind.speed} m/s</p>
            <p  style=" font-size: 13px; font-weight:600;" >${day.weather[0].description}</p>
        `;

        // Append the weather icon image element separately to allow fallback handling
        forecastBox.appendChild(imgElement);

        // Add the forecast box to the forecast section
        forecast.appendChild(forecastBox);
    });
}



