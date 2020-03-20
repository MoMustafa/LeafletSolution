L.Control.GeoJSONInfo = L.Control.extend({
    initialize: function (options) {
        L.setOptions(this, options); 
    },

    onAdd: function (map) {
        this._div = L.DomUtil.create('div', 'info'); 
        this.update();
        return this._div;
    },

    update: function (feature) {
        this._div.innerHTML = '<h4>Selection Details</h4>' +
            (feature ? '<b>' + feature.NAME + '</b><br />' : '');
    }
});