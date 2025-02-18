console.log("form.js is loaded");

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    // Get references
    const form = document.getElementById("police-form");
    const dropdown = document.getElementById("police-forces");
    const yearDropdown = document.getElementById("year");
    const monthDropdown = document.getElementById("month");
    const apiUrlDisplay = document.getElementById("api-url");

    // Constabularies
    const policeForces = [
        { "id": "avon-and-somerset", "name": "Avon and Somerset Constabulary" },
        { "id": "bedfordshire", "name": "Bedfordshire Police" },
        { "id": "cambridgeshire", "name": "Cambridgeshire Constabulary" },
        { "id": "cheshire", "name": "Cheshire Constabulary" },
        { "id": "city-of-london", "name": "City of London Police" },
        { "id": "cleveland", "name": "Cleveland Police" },
        { "id": "cumbria", "name": "Cumbria Constabulary" },
        { "id": "derbyshire", "name": "Derbyshire Constabulary" },
        { "id": "devon-and-cornwall", "name": "Devon & Cornwall Police" },
        { "id": "dorset", "name": "Dorset Police" },
        { "id": "durham", "name": "Durham Constabulary" },
        { "id": "dyfed-powys", "name": "Dyfed-Powys Police" },
        { "id": "essex", "name": "Essex Police" },
        { "id": "gloucestershire", "name": "Gloucestershire Constabulary" },
        { "id": "greater-manchester", "name": "Greater Manchester Police" },
        { "id": "gwent", "name": "Gwent Police" },
        { "id": "hampshire", "name": "Hampshire Constabulary" },
        { "id": "hertfordshire", "name": "Hertfordshire Constabulary" },
        { "id": "humberside", "name": "Humberside Police" },
        { "id": "kent", "name": "Kent Police" },
        { "id": "lancashire", "name": "Lancashire Constabulary" },
        { "id": "leicestershire", "name": "Leicestershire Police" },
        { "id": "lincolnshire", "name": "Lincolnshire Police" },
        { "id": "merseyside", "name": "Merseyside Police" },
        { "id": "metropolitan", "name": "Metropolitan Police Service" },
        { "id": "norfolk", "name": "Norfolk Constabulary" },
        { "id": "north-wales", "name": "North Wales Police" },
        { "id": "north-yorkshire", "name": "North Yorkshire Police" },
        { "id": "northamptonshire", "name": "Northamptonshire Police" },
        { "id": "northumbria", "name": "Northumbria Police" },
        { "id": "nottinghamshire", "name": "Nottinghamshire Police" },
        { "id": "northern-ireland", "name": "Police Service of Northern Ireland" },
        { "id": "south-wales", "name": "South Wales Police" },
        { "id": "south-yorkshire", "name": "South Yorkshire Police" },
        { "id": "staffordshire", "name": "Staffordshire Police" },
        { "id": "suffolk", "name": "Suffolk Constabulary" },
        { "id": "surrey", "name": "Surrey Police" },
        { "id": "sussex", "name": "Sussex Police" },
        { "id": "thames-valley", "name": "Thames Valley Police" },
        { "id": "warwickshire", "name": "Warwickshire Police" },
        { "id": "west-mercia", "name": "West Mercia Police" },
        { "id": "west-midlands", "name": "West Midlands Police" },
        { "id": "west-yorkshire", "name": "West Yorkshire Police" },
        { "id": "wiltshire", "name": "Wiltshire Police" }
    ];

    // Populate year dropdown (2022 to 2024)
    const startYear = 2022;
    const endYear = 2024;


    // Populate month dropdown (Jan - Dec)
    const months = [
        { value: "01", name: "January" },
        { value: "02", name: "February" },
        { value: "03", name: "March" },
        { value: "04", name: "April" },
        { value: "05", name: "May" },
        { value: "06", name: "June" },
        { value: "07", name: "July" },
        { value: "08", name: "August" },
        { value: "09", name: "September" },
        { value: "10", name: "October" },
        { value: "11", name: "November" },
        { value: "12", name: "December" }
    ];

    // Populate police forces dropdown
    policeForces.forEach(force => {
        const option = document.createElement("option");
        option.value = force.id;
        option.textContent = force.name;
        dropdown.appendChild(option);
    });

    // Populate year dropdown
    for (let year = endYear; year >= startYear; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }

    // Populate month dropdown
    months.forEach(month => {
        const option = document.createElement("option");
        option.value = month.value;
        option.textContent = month.name;
        monthDropdown.appendChild(option);
    });

    // Create map (but don't display until data is fetched)
    const map = L.map('map').setView([51.50, 0.1272], 6); // Default to central London

    // Use OpenStreetMap tiles (you can replace with Mapbox if needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    
    // Event listener for form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

    // Get selected values
    const selectedForce = dropdown.value;
    const selectedYear = yearDropdown.value;
    const selectedMonth = monthDropdown.value;

    // Construct the API URL
    const apiUrl = `https://data.police.uk/api/stops-force?force=${selectedForce}&date=${selectedYear}-${selectedMonth}`;

    // Display API call in the browser
    apiUrlDisplay.textContent = apiUrl;
    apiUrlDisplay.style.fontWeight = "bold";
    apiUrlDisplay.style.color = "blue";

    // Fetch data from the API
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log("Data fetched:", data);
        if (data.length === 0) {
            alert("No data available for this selection.");
            return;
        }

        // Clear previous markers
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Loop through the data and plot on the map
        data.forEach(item => {
            if (item.location && item.location.latitude && item.location.longitude) {
                const latitude = item.location.latitude;
                const longitude = item.location.longitude;

                // Create a marker on the map for each stop
                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup(`<b>Object of Search:</b> ${item.object_of_search}
                        <br><b>Outcome:</b> ${item.outcome}
                        <br><b>Ethnicity:</b> ${item.self_defined_ethnicity}
                        <br><b>Gender:</b> ${item.gender}`)
                    .openPopup();
            }
        });
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
});

});
    