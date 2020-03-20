var app = angular.module('MainApp', []);

app.controller('HomeCtrl', function ($scope, $timeout) {
    $scope.initialize = function () {
        $scope.overlayEnabled = false;
        CreateMap();
    };

    var CreateMap = function () {
        $scope.map = L.map('LeafletMap').setView([33.8650, -96.6561], 5);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo($scope.map);

        var editableLayers = new L.FeatureGroup();
        $scope.map.addLayer(editableLayers);

        $scope.GeoJsonLayer = new L.FeatureGroup();
        $scope.GeoJsonLayer.bringToBack();

        $scope.Heatmap = new L.HeatLayer();

        var options = {
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
                        color: '#e1e100',
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
                featureGroup: editableLayers,
                remove: true
            }
        };

        var drawControl = new L.Control.Draw(options);
        $scope.map.addControl(drawControl);

        var fullscreenControl = new L.control.fullscreen({
            position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
            forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
            forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        });

        $scope.map.addControl(fullscreenControl);

        $scope.map.addLayer($scope.GeoJsonLayer);

        //EVENT HANDLERS
        $scope.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

            editableLayers.addLayer(layer);
        });
    };

    $scope.getGeoJson = function (name) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open("GET", "../../Content/GeoJSON/" + name + "_geo.json", true);
        xobj.send(null);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                var geojson = L.geoJson(JSON.parse(xobj.responseText), {
                    style: styleGeoJson
                    //onEachFeature: StateHoverEffect
                });
                $scope.GeoJsonLayer.clearLayers();
                $scope.GeoJsonLayer.addLayer(geojson);
                $scope.overlayEnabled = true;

                $timeout($scope.$apply(), 100);
            }
        };
    };

    $scope.removeGeoJson = function () {
        $('input:radio[name=Overlay]').each(function () { $(this).prop('checked', false); });
        $scope.GeoJsonLayer.clearLayers();
        $scope.overlayEnabled = false;

        $timeout($scope.$apply(), 100);
    };

    var styleGeoJson = function (feature) {
        return {
            fillColor: '#bada55',
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.4
        };
    };

    $scope.GetHeatMap = function () {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open("GET", "../../Content/heatmap/heatmapData.json", true);
        xobj.send(null);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                var heatmap = JSON.parse(xobj.responseText);
                $scope.Heatmap._latlngs = [];
                angular.forEach(heatmap, function (value, key) {
                    var latlng = L.latLng(value.latitude, value.longitude);
                    $scope.Heatmap.addLatLng(latlng);
                });

                $scope.Heatmap.addTo($scope.map);
            }
        };
    }

});