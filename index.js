// DOM Elements
const countriesContainer = document.querySelector(".countries-container");
const btnSort = document.querySelectorAll(".btnSort");
const themeSwitch = document.querySelector('.theme-switch');
const inputSearch = document.querySelector('#inputSearch');
const inputRange = document.querySelector('#inputRange');
const rangeValue = document.querySelector('#rangeValue');

// Global state
let countriesData = [];
let sortMethod = "maxToMin";

// Theme preferences
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Fetches countries data from the REST Countries API
 * @returns {Promise<void>}
 */
async function fetchCountries() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error('Failed to fetch countries');
        countriesData = await response.json();
        countriesDisplay();
    } catch (error) {
        console.error('Error fetching countries:', error);
        displayError();
    }
}

/**
 * Displays error message in the container
 */
function displayError() {
    countriesContainer.innerHTML = `
        <div class="error-message">
            <h2>Failed to load countries data</h2>
            <p>Please try again later</p>
        </div>
    `;
}

/**
 * Filters countries based on search input
 * @param {Array} countries - Array of country objects
 * @returns {Array} Filtered countries array
 */
function filterCountries(countries) {
    const searchTerm = inputSearch.value.toLowerCase();
    return countries.filter(country => 
        country.translations.fra.common.toLowerCase().includes(searchTerm)
    );
}

/**
 * Sorts countries based on selected sort method
 * @param {object} a - First country object
 * @param {object} b - Second country object
 * @returns {number} Comparison result
 */
function sortCountries(a, b) {
    switch (sortMethod) {
        case "maxToMin":
            return b.population - a.population;
        case "minToMax":
            return a.population - b.population;
        case "alpha":
            return a.translations.fra.common.localeCompare(b.translations.fra.common);
        default:
            return 0;
    }
}

/**
 * Creates HTML for a single country card
 * @param {object} country - Country data object
 * @returns {string} HTML string for the country card
 */
function createCountryCard(country) {
    const { translations, flags, capital, population, maps } = country;
    const countryName = translations.fra.common;
    
    return `
        <div class="card">
            <img src=${flags.svg} alt="flag of ${countryName}">
            <h2>${countryName}</h2>
            <h4>Capital: ${capital || 'Not available'}</h4>
            <p>Population: ${population.toLocaleString()}</p>
            <div class="card-links">
                <a href="${maps.googleMaps}" target="_blank" class="country-link">
                    <i class="fas fa-map-marker-alt"></i> View on Google Maps
                </a>
                <a href="https://www.google.com/search?q=${encodeURIComponent(countryName)}" 
                   target="_blank" class="country-link">
                    <i class="fas fa-search"></i> Learn more
                </a>
            </div>
        </div>
    `;
}

/**
 * Displays filtered and sorted countries in the container
 */
function countriesDisplay() {
    const filteredCountries = filterCountries(countriesData)
        .sort(sortCountries)
        .slice(0, inputRange.value);
    
    countriesContainer.innerHTML = filteredCountries
        .map(createCountryCard)
        .join("");
}

/**
 * Updates the theme button text based on current theme
 * @param {string} theme - Current theme ('dark' or 'light')
 */
function updateThemeButton(theme) {
    themeSwitch.textContent = theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
}

/**
 * Toggles between dark and light themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

/**
 * Initializes theme based on saved preference or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

/**
 * Updates the range value display
 */
function updateRangeDisplay() {
    countriesDisplay();
    rangeValue.textContent = inputRange.value;
}

/**
 * Updates sort method and refreshes display
 * @param {Event} e - Click event object
 */
function handleSort(e) {
    sortMethod = e.target.id;
    countriesDisplay();
}

// Event Listeners
window.addEventListener("load", () => {
    fetchCountries();
    initTheme();
});
inputSearch.addEventListener("input", countriesDisplay);
inputRange.addEventListener("input", updateRangeDisplay);
btnSort.forEach(btn => btn.addEventListener("click", handleSort));
themeSwitch.addEventListener('click', toggleTheme);