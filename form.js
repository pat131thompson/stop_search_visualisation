console.log("form.js is loaded");

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    // Get references
    const form = document.getElementById("police-form");
    const dropdown = document.getElementById("police-forces");
    const yearDropdown = document.getElementById("year");
    const monthDropdown = document.getElementById("month");
    const apiUrlDisplay = document.getElementById("api-url");

    // Chart.js canvas elements
    const ethnicityChartCanvas = document.getElementById("ethnicityChart");
    const outcomeChartCanvas = document.getElementById("outcomeChart");

    // Chart instances stored globally
    let ethnicityChart, outcomeChart;

    // Constabularies list
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

    // Populate dropdowns
    policeForces.forEach(force => {
        dropdown.innerHTML += `<option value="${force.id}">${force.name}</option>`;
    });

    for (let year = 2024; year >= 2022; year--) {
        yearDropdown.innerHTML += `<option value="${year}">${year}</option>`;
    }

    const months = [
        { value: "01", name: "January" }, { value: "02", name: "February" },
        { value: "03", name: "March" }, { value: "04", name: "April" },
        { value: "05", name: "May" }, { value: "06", name: "June" },
        { value: "07", name: "July" }, { value: "08", name: "August" },
        { value: "09", name: "September" }, { value: "10", name: "October" },
        { value: "11", name: "November" }, { value: "12", name: "December" }
    ];

    months.forEach(month => {
        monthDropdown.innerHTML += `<option value="${month.value}">${month.name}</option>`;
    });

    // Initialize Leaflet Map
    const map = L.map('map').setView([51.50, 0.1272], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Form submission event
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const apiUrl = `https://data.police.uk/api/stops-force?force=${dropdown.value}&date=${yearDropdown.value}-${monthDropdown.value}`;
        apiUrlDisplay.textContent = apiUrl;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    alert("No data available.");
                    return;
                }

                // Clear markers
                map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });

                // Plot locations
                data.forEach(item => {
                    if (item.location) {
                        L.marker([item.location.latitude, item.location.longitude])
                            .addTo(map)
                            .bindPopup(`<b>Object:</b> ${item.object_of_search}<br><b>Outcome:</b> ${item.outcome}`);
                    }
                });

                updateCharts(data);
            })
            .catch(error => console.error("Error fetching data:", error));
    });

    function updateCharts(data) {
        const ethnicityCounts = {};
        const outcomeCounts = {};

        data.forEach(item => {
            ethnicityCounts[item.self_defined_ethnicity] = (ethnicityCounts[item.self_defined_ethnicity] || 0) + 1;
            outcomeCounts[item.outcome] = (outcomeCounts[item.outcome] || 0) + 1;
        });

        // Make the charts visible
        document.querySelectorAll('.chart-container').forEach(chart => {
            chart.style.display = "flex";  // Show charts
        });

        createChart("ethnicityChart", "Ethnicity Breakdown", Object.keys(ethnicityCounts), Object.values(ethnicityCounts));
        createChart("outcomeChart", "Outcomes", Object.keys(outcomeCounts), Object.values(outcomeCounts));
    }

    function createChart(canvasId, title, labels, data) {
        if (window[canvasId] instanceof Chart) {
            window[canvasId].destroy();
        }
        window[canvasId] = new Chart(document.getElementById(canvasId), {
            type: "bar",
            data: { labels, datasets: [{ label: title, data, backgroundColor: "blue" }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }
});
