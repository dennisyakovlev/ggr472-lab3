mapboxgl.accessToken = "pk.eyJ1IjoiZGVubmlzeWFrb3ZsZXY0MCIsImEiOiJjbHMyNnViazIwMHB5MmpvNHlvc3B2bDQ2In0.nTDRJJnhgM_EW8tSwyOchg";

const map = new mapboxgl.Map({
	container: 'my-map', // container ID
	style: 'mapbox://styles/dennisyakovlev40/clskppghq03u401p2c3184488', // my edited monochrone
	center: [-73.9, 40.7], // starting position [lng, lat], aim at NYC
	zoom: 9, // starting tile zoom
});

map.on("load", () => {

    // https://www.nyc.gov/site/planning/data-maps/open-data/census-download-metadata.page
    map.addSource('nyc-data', {
      'type': 'geojson',
      'data': 'https://ggr472-dennis-data.s3.us-east-2.amazonaws.com/data-nyc.geojson'
    });
    var dataLayer = map.addLayer({
        'id': 'nyc-data-lyr',
        'type': 'fill',
        'source': 'nyc-data', // source ref
        'layout': {},
        'paint': {
            'fill-color': '#0080ff',
            // using this is outdated but using "step" doesn't create a grandient
            'fill-opacity': {
                property: 'Shape__Area',
                stops: [
                    [0,0.15],
                    [100000000,0.85]
                ]
            }
        }
    });
    map.addLayer({
        'id': 'nyc-data-lyr-border',
        'type': 'line',
        'source': `nyc-data`, // source ref
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                5,
                2
            ]
        }
    });



    // https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/
    var hoveredPolygonId = null;
    var currentPopup = null;
    map.on("mousemove", 'nyc-data-lyr', (e) => {
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState( // set old hovered over to be normal
                    { source: 'nyc-data', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            const feature = e.features[0];
            const hoverIdNew = feature.id;
            // set only once when mouse over shape
            if (hoverIdNew!=hoveredPolygonId || hoveredPolygonId===null)
            {
                const raw_coords = feature.geometry.coordinates.slice();
                // two cases of
                //      1. only 1 polygon for tract (pick first)
                //      2. >1 polygon then take polygon with most points
                const coord_arr = Array.isArray(raw_coords[0][0][0])==false ?
                    raw_coords[0] :
                    raw_coords[raw_coords.reduce(
                        (mx,curr,ind) => raw_coords[mx][0].length < raw_coords[ind][0].length ?
                            ind :
                            mx,
                        0
                    )][0];

                // find polygon centroid, should be good enough for popup lat long
                var coords = [0,0];
                for (var i=0;i!=coord_arr.length;++i)
                {
                    const pair = coord_arr[i];
                    coords[0]+=pair[0];
                    coords[1]+=pair[1];
                }
                coords[0]/=coord_arr.length;
                coords[1]/=coord_arr.length;

                // styling doesnt work
                // https://docs.mapbox.com/help/tutorials/building-a-store-locator/#define-interactivity-functions
                // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
                if (currentPopup) currentPopup.remove();
                currentPopup = new mapboxgl.Popup({
                    closeButton: false})
                    .setLngLat(coords)
                    .setHTML(`
                        <p>Name: ${feature.properties.NTAName}</p>
                        <p>Borough: ${feature.properties.BoroName}</p>
                        <p>Area: ${(feature.properties.Shape__Area/27878555).toFixed(2)} mi²</p>`)
                    .addTo(map);
            }

            // hoveredPolygonId = e.features[0].id;
            hoveredPolygonId = hoverIdNew;
            map.setFeatureState(
                { source: 'nyc-data', id: hoveredPolygonId },
                { hover: true }
            );
        }
    });
    map.on('mouseleave', 'nyc-data-lyr', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState( // set old hovered over to be normal
                { source: 'nyc-data', id: hoveredPolygonId },
                { hover: false }
            );
        }
        if (currentPopup) currentPopup.remove();
        hoveredPolygonId = null;
        currentPopup = null;
    });



    const btn1 = new Button('btn-1');
    var stateTransitions = 1;
    btn1.addOnFunc(function(e) { // change to borough color scheme
        map.setPaintProperty('nyc-data-lyr', 'fill-color', [
            'case',
            ['==', ['get', 'BoroCode'], 1], 'green',
            ['==', ['get', 'BoroCode'], 2], 'orange',
            ['==', ['get', 'BoroCode'], 3], 'cyan',
            ['==', ['get', 'BoroCode'], 4], 'red',
            ['==', ['get', 'BoroCode'], 5], 'purple',
            '#0080ff'
        ],);

        transitionFunc(e, stateTransitions);
        stateTransitions += 1;
    });
    btn1.addOffFunc(function(e) { // change to monochrome color scheme
        map.setPaintProperty('nyc-data-lyr', 'fill-color', '#0080ff');

        transitionFunc(e, stateTransitions);
        stateTransitions += 1;
    });

    const btn2 = new Button('btn-2');
    var randomizedCalls = 1;
    btn2.addOnFunc(function(e) {
        var toSetText;
        if (stateTransitions%2==0)
        {
            toSetText = 'Need Monochrome';
        }
        else
        {
            // bijection between [0x0,0xffffff] -> [0,16777215]
            toSetText = (Math.round(Math.random()*16777215)).toString(16);
        }

        $($(e.currentTarget).children()[1]).text(toSetText);
        map.setPaintProperty('nyc-data-lyr', 'fill-color', `#${toSetText}`);

        transitionFunc(e, randomizedCalls);
        randomizedCalls += 1;
    });
    btn2.addOffFunc(function(e) {
        transitionFunc(e, randomizedCalls);

        console.log(4);
        randomizedCalls += 1;
    });

});
