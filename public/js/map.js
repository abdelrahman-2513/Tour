maptilersdk.config.apiKey = 'LFiNeAbDOlW8Jx7FPvRO';

if (document.getElementById('map'))
    new maptilersdk.Map({
        container: 'map', // container's id or the HTML element to render the map
        style: "backdrop",
        center: [16.62662018, 49.2125578], // starting position [lng, lat]
        zoom: 14, // starting zoom
        interactive: false
    });