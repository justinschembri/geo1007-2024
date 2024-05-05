// Definition Rijksdriehoekstelsel (EPSG:28992)
let res = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105];
let map = L.map('map-canvas', {
  continuousWorld: true,
  crs: new L.Proj.CRS('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs', {
    transformation: L.Transformation(-1, -1, 0, 0),
    resolutions: res,
    origin: [-285401.920, 903401.920],
    bounds: L.bounds([-285401.920, 903401.920], [595401.920, 22598.080])
  }),
  layers: [],
  center: [52.010, 4.36744],
  zoom: 9,

});
map.attributionControl.setPrefix('');

// BRT - (Base Registry Topography) BaseMap PDOK:
let options = { maxZoom: 14, attribution: 'Map data: <a href="http://www.pdok.nl">BRT Achtergrondkaart</a>' }
let basemap_pdok = new L.tileLayer('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:28992/{z}/{x}/{y}.png', options);

basemap_pdok.getAttribution = function () {
  return 'BRT Achtergrondkaart <a href="http://www.kadaster.nl">Kadaster</a>.';
}
basemap_pdok.addTo(map);

// To group the base layers (background) and make the ToC widget
let baseLayers = {
  "Topographical map": basemap_pdok
};
let toc = L.control.layers(baseLayers).addTo(map);

// Register a geocoder to the map app 
register_geocoder = function (mapInstance) {
  let polygon = null;

  function clear() {
    if (polygon !== null) {
      mapInstance.removeLayer(polygon);
    }
  }

  var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
  })
    .on('markgeocode', function (e) {
      clear()
      var bbox = e.geocode.bbox;
      polygon = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest()
      ]);
      mapInstance.addLayer(polygon);
      mapInstance.fitBounds(polygon.getBounds());
      setTimeout(clear, 2500);
    })
    .addTo(mapInstance);
  return geocoder;
}

register_geocoder(map)

function registerGeoLocate(mapInstance) {
  mapInstance.locate({ setView: true, maxZoom: 16 });

  function onLocationFound(e) {
    var radius = e.accuracy;

    let m = L.marker(e.latlng).addTo(map)
      .bindPopup("You are within " + radius.toFixed(1) + " meters from this point").openPopup();

    let c = L.circle(e.latlng, radius).addTo(map);

    setTimeout(function () {
      mapInstance.removeLayer(m);
      mapInstance.removeLayer(c);
    },
      25000);
  }

  mapInstance.on('locationfound', onLocationFound);

  function onLocationError(e) {
    alert(e.message);
  }

  mapInstance.on('locationerror', onLocationError);
}
registerGeoLocate(map)

function registerPopUpForInsert(mapInstance) {
  var popup = L.popup();

  function onMapClick(e) {
    var lng = e.latlng.lng;
    var lat = e.latlng.lat;

    var js_function = ''
      + ' var poi_name = document.getElementById(\'poi_name\').value ; '
      + ' var reported_by = document.getElementById(\'reported_by\').value ; '
      + ' insertWFS(' + lng + ',' + lat + ', poi_name, reported_by) ; ';

    var popupContent = ''
      + '<label for="poi_name">Point of Interest: </label><br>'
      + '<input type="text" id="poi_name" name="poi_name" value=""><br>'
      + '<label for="reported_by" >Reported by: </label><br>'
      + '<input type="text" id="reported_by" name="reported_by" value=""><br>'
      + '<button type="button" onclick="' + js_function + '">Insert point</button>';

    popup
      .setLatLng(e.latlng)
      .setContent(popupContent)
      .openOn(mapInstance);
  }

  mapInstance.on('click', onMapClick);
}
registerPopUpForInsert(map)