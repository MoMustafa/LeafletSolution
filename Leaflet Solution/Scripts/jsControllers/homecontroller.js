﻿var app = angular.module('MainApp', ["angucomplete-alt"]);

app.controller('HomeCtrl', function ($scope, $timeout, $http) {
    $scope.initialize = function () {
        $scope.StateSelected = false;
        $scope.CovidSelected = false;
        CreateMap();
    };

    $scope.initializeModal = function () {
        $('#strokeColor').colorpicker();
        $('#fillColor').colorpicker();

        $('#strokeColor').on('colorpickerChange', function (event) {
            $scope.geoJsonStyle.color = event.color.toString();
        });

        $('#fillColor').on('colorpickerChange', function (event) {
            $scope.geoJsonStyle.fillColor = event.color.toString();
        });
    };

    var initializeSearchTerms = function () {
        $scope.cities = [];
        $http.get("https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&rows=3000&refine.state=" + $scope.StateSelected)
            .then(function (response) {
                angular.forEach(response.data.records, function (value, key) {
                    const exists = $scope.cities.some(city => city.name == value.fields.city + ", " + value.fields.state);
                    if (!exists) {
                        $scope.cities.push({
                            name: value.fields.city + ", " + value.fields.state,
                            lat: value.fields.latitude,
                            lng: value.fields.longitude
                        });
                    }
                });
            });
    };

    var CreateMap = function () {
        $scope.overlayEnabled = false;
        $scope.heatmapEnabled = false;
        $scope.showSelections = false;

        $scope.mapCenter = L.latLng(33.8650, -96.6561)

        $scope.map = L.map('LeafletMap').setView($scope.mapCenter, 5);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo($scope.map);

        $scope.editableLayers = new L.FeatureGroup();
        $scope.drawOptions.edit.featureGroup = $scope.editableLayers;
        $scope.map.addLayer($scope.editableLayers);

        $scope.GeoJsonLayer = new L.FeatureGroup();
        $scope.GeoJsonLayer.bringToBack();

        $scope.Heatmap = new L.HeatLayer([], {radius: 25});

        var drawControl = new L.Control.Draw($scope.drawOptions);
        $scope.map.addControl(drawControl);

        var fullscreenControl = new L.control.fullscreen({
            position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
            forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
            forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        });

        $scope.map.addControl(fullscreenControl);

        $scope.map.addLayer($scope.GeoJsonLayer);

        $scope.GeoJsonInfo = new L.Control.GeoJSONInfo({ position: 'bottomleft' });

        $scope.SelectionsMade = [];

        //EVENT HANDLERS
        $scope.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

            $scope.editableLayers.addLayer(layer);
            var id = $scope.editableLayers.getLayerId(layer);
            $scope.editableLayers._layers[id].type = type;

            $scope.showSelections = true;

            $timeout($scope.safeApply(), 100);
        });

        $scope.map.on(L.Draw.Event.DELETED, function (e) {
            if ($scope.editableLayers.getLayers().length == 0)
                $scope.showSelections = false;

            $timeout($scope.safeApply(), 100);
        });

        $scope.map.on(L.Draw.Event.EDITED, function (e) {
            $timeout($scope.safeApply(), 100);
        });

        $scope.map.on('moveend', function (e) {
            var center = $scope.map.getCenter();
            $scope.mapCenter.lat = $scope._round(center.lat, 4);
            $scope.mapCenter.lng = $scope._round(center.lng, 4);

            $timeout($scope.safeApply(), 100);
        });
    };

    // Truncate value based on number of decimals
    $scope._round = function (num, len) {
        return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
    };
    // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
    $scope.strLatLng = function (latlng) {
        return "(" + $scope._round(latlng.lat, 6) + ", " + $scope._round(latlng.lng, 6) + ")";
    };

    $scope.initGeoJson = function (name) {
        if (name == 'us_states')
            document.getElementById('Covid').removeAttribute("disabled");
        else {
            document.getElementById('Covid').setAttribute("disabled", "true");
            $scope.removeHeatmaps();
        }

        $scope.StateSelected = false;
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open("GET", "../../Content/GeoJSON/" + name + "_geo.json", true);
        xobj.send(null);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                $scope.geojson = L.geoJson(JSON.parse(xobj.responseText), {
                    style: styleGeoJson,
                    onEachFeature: onEachFeature
                });
                $scope.GeoJsonLayer.clearLayers();
                $scope.GeoJsonLayer.addLayer($scope.geojson);
                $scope.overlayEnabled = true;

                $timeout($scope.safeApply(), 100);
            }
        };
    };

    $scope.removeGeoJson = function () {
        $('input:radio[name=Overlay]').each(function () { $(this).prop('checked', false); });
        $scope.GeoJsonLayer.clearLayers();
        $scope.overlayEnabled = false;
        $scope.StateSelected = false;
        document.getElementById('Covid').setAttribute("disabled", "true");
    };

    $scope.geoJsonStyle = {
        stroke: true,
        weight: 0,
        opacity: 0.75,
        color: 'rgb(255, 128, 0)',
        fill: true,
        fillColor: 'rgb(255, 128, 0)',
        fillOpacity: 0.1
    }

    $scope.drawOptions = {
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#f357a1',
                    message: '<strong>Oh snap!<strong> you can\'t draw that!'
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: true,
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            }
        },
        edit: {
            remove: true
        }
    };

    $scope.updateOverlayOptions = function () {
        $scope.geojson.setStyle($scope.geoJsonStyle);
    };

    var styleGeoJson = function (feature) {
        return $scope.geoJsonStyle;
    };

    var onEachFeature = function (feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature
        });
    };

    var highlightFeature = function (e) {
        var layer = e.target;

        layer.setStyle({
            weight: $scope.geoJsonStyle.weight + 3
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        $scope.map.addControl($scope.GeoJsonInfo);
        $scope.GeoJsonInfo.update(layer.feature.properties);

        if ($scope.StatesAdded.some(obj => obj.state == layer.feature.properties.NAME)) {
            var result = $scope.StatesAdded.find(obj => {
                return obj.state == layer.feature.properties.NAME
            });

            $scope.GeoJsonInfo.append(
                '<p><u><b>SARS-CoV-2 Cases</b></u><br />' +
                '<b>Confirmed: </b>' + result.confirmed + '<br />' +
                '<b>Recovered: </b>' + result.recovered + '<br />' +
                '<b>Deaths: </b>' + result.deaths + '</p>');
        }
    };

    var resetHighlight = function (e) {
        $scope.geojson.resetStyle(e.target);
        $scope.GeoJsonInfo.update();
        $scope.map.removeControl($scope.GeoJsonInfo);
    };

    var clickFeature = function (e) {
        var state = e.target.feature.properties.NAME
        $scope.StateSelected = state;
        initializeSearchTerms();

        if ($scope.CovidSelected) {
            $scope.getCovidHeatmap(state);
        }
        
    };

    $scope.PanMap = function (e) {
        if ($scope.panInput.panLat.$valid && $scope.panInput.panLng.$valid) {
            $scope.map.panTo($scope.mapCenter);
        }
    };

    $scope.PanBySelection = function (input) {
        $scope.map.setView([input.originalObject.lat, input.originalObject.lng], 8);
    };

    $scope.initHeatmap = function (heatmapName) {
        $scope.Heatmap.setLatLngs([]);
        $scope.StatesAdded = [];

        if (heatmapName == 'covid') {
            $scope.CovidSelected = true;
            $scope.Heatmap.setOptions({ radius: 10, maxZoom: 5 });
            return;
        }

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open("GET", "../../Content/heatmap/" + heatmapName +".json", true);
        xobj.send(null);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                var heatmap = JSON.parse(xobj.responseText);
                angular.forEach(heatmap, function (value, key) {
                    var latlng = L.latLng(value.latitude, value.longitude);
                    $scope.Heatmap.addLatLng(latlng);
                });

                $scope.Heatmap.addTo($scope.map);
                $scope.heatmapEnabled = true;

                $timeout($scope.safeApply(), 100);
            }
        };
    };

    $scope.getCovidHeatmap = function (state) {
        if (!$scope.StatesAdded.some(obj => obj.state == state)) {
            $http.get("https://coronavirus-tracker-api.herokuapp.com/v2/locations?country_code=US&province=" + state + "&source=csbs")
                .then(function (response) {

                    $scope.StatesAdded.push({
                        state: state,
                        confirmed: response.data.latest.confirmed,
                        recovered: response.data.latest.recovered,
                        deaths: response.data.latest.deaths
                    });

                    $scope.GeoJsonInfo.append(
                        '<p><u><b>SARS-CoV-2 Cases</b></u><br />' +
                        '<b>Confirmed: </b>' + response.data.latest.confirmed + '<br />' +
                        '<b>Recovered: </b>' + response.data.latest.recovered + '<br />' +
                        '<b>Deaths: </b>' + response.data.latest.deaths + '</p>');

                    angular.forEach(response.data.locations, function (value, key) {
                        var latlng = L.latLng(value.coordinates.latitude, value.coordinates.longitude);
                        $scope.Heatmap.addLatLng(latlng);
                    });

                    if (!$scope.heatmapEnabled) {
                        $scope.Heatmap.addTo($scope.map);
                        $scope.heatmapEnabled = true;
                    }

                    $timeout($scope.safeApply(), 100);
                });
        }
    };

    $scope.removeHeatmaps = function () {
        $('input:radio[name=Heatmaps]').each(function () { $(this).prop('checked', false); });
        $scope.Heatmap.setLatLngs([]);
        $scope.heatmapEnabled = false;
        $scope.CovidSelected = false;
        $scope.StatesAdded = [];
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
});