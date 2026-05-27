// Select DOM elements
const currencySelectElements = document.querySelectorAll("form select");
const sourceCurrencySelect = document.getElementById("fromCurrency");
const targetCurrencySelect = document.getElementById("toCurrency");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const exchangeRateText = document.getElementById("resultDiv");
const convertButton = document.querySelector("button");
const amountInput = document.getElementById("amountInput");

// Populate currency options
function populateCurrencyOptions() {
    for (const currencyCode in country_list) {
        const country = country_list[currencyCode].country;
        const optionElement = `<option value="${currencyCode}">${currencyCode} - ${country}</option>`;
        sourceCurrencySelect.insertAdjacentHTML("beforeend", optionElement);
        targetCurrencySelect.insertAdjacentHTML("beforeend", optionElement);
    }

    // Set default values
    sourceCurrencySelect.value = 'INR';  // Default "From" currency to INR
    targetCurrencySelect.value = 'USD';  // Default "To" currency to USD
    updateFlag(sourceCurrencySelect);  // Update flag for "From" currency
    updateFlag(targetCurrencySelect);  // Update flag for "To" currency
}

// Update flag icon based on selected currency
function updateFlag(selectElement) {
    const selectedCurrencyCode = selectElement.value;
    const flagImage = selectElement.parentElement.querySelector("img");

    if (country_list[selectedCurrencyCode]) {
        const countryCode = country_list[selectedCurrencyCode].code.toLowerCase();
        flagImage.src = `https://flagcdn.com/48x36/${countryCode}.png`;
    } else {
        flagImage.src = ''; // Clear the flag if currency code is not found
    }
}

// Fetch exchange rates
const apiURL = 'https://api.exchangerate-api.com/v4/latest/INR'; // Use USD as base for general use
fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        const currencies = Object.keys(data.rates);
        currencies.forEach(currency => {
            const fromOption = document.createElement('option');
            const toOption = document.createElement('option');
            fromOption.value = currency;
            fromOption.textContent = `${currency} - ${country_list[currency]?.country || 'Unknown Country'}`;
            toOption.value = currency;
            toOption.textContent = `${currency} - ${country_list[currency]?.country || 'Unknown Country'}`;
            sourceCurrencySelect.appendChild(fromOption);
            targetCurrencySelect.appendChild(toOption);
        });

        // Set default flag images
        updateFlag(sourceCurrencySelect);
        updateFlag(targetCurrencySelect);
    })
    .catch(error => {
        console.error('Error fetching exchange rates:', error);
    });

// Handle currency conversion
convertButton.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    const sourceCurrency = sourceCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        exchangeRateText.textContent = 'Please enter a valid amount';
        return;
    }

    fetch(`${apiURL}`)
        .then(response => response.json())
        .then(data => {
            const rate = data.rates[targetCurrency] / data.rates[sourceCurrency];
            if (rate) {
                const convertedAmount = (amount * rate).toFixed(2);
                exchangeRateText.textContent = `${amount} ${sourceCurrency} = ${convertedAmount} ${targetCurrency}`;
            } else {
                exchangeRateText.textContent = 'Conversion rate not available';
            }
        })
        .catch(error => {
            console.error('Error fetching conversion rate:', error);
            exchangeRateText.textContent = 'Error fetching conversion rate';
        });
});

// Initialize
populateCurrencyOptions();
currencySelectElements.forEach(selectElement => {
    selectElement.addEventListener("change", (event) => {
        if (event.target.id === "fromCurrency") {
            updateFlag(document.getElementById("fromCurrency"));
        } else if (event.target.id === "toCurrency") {
            updateFlag(document.getElementById("toCurrency"));
        }
    });
});
