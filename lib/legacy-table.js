var moment = require('moment');
var CoreObject = require('core-object');

module.exports = CoreObject.extend({
  init: function(plugin, revisions) {
    this._super(plugin, revisions);

    this._plugin = plugin;
    this.revisions = revisions;
  },

  log: function() {
    this._plugin.log.apply(this._plugin, arguments);
  },

  display: function() {
    var revisions = this.revisions;
    var keys = this._getKeys(revisions);

    this._displayHeader(keys, revisions);

    revisions.forEach(function(revision) {
      this._displayRow(keys, revision);
    }.bind(this));
  },

  _displayRow: function(keys, revision) {
    var row = "";
    if(revision.active) {
      row += ">";
    } else {
      row += " ";
    }

    var lastKey = keys[keys.length - 1];

    keys.forEach(function(key) {
      var value = revision[key.name] ? revision[key.name] : "";

      if(key.name === 'timestamp') {
        value = moment(value).format("YYYY/MM/DD HH:mm:ss");
      }

      if(key.maxLength !== -1) {
        value = String(value).substr(0, key.maxLength);
      }

      row += " " + value + " ";

      var fillerLength = key.maxLength - value.length;
      for(var i = 0; i < fillerLength; i++) {
        row += " ";
      }
      if(key !== lastKey) {
        row += "|";
      }
    });

    this.log(row);
  },

  _getKeys: function(revisions) {
    var keys = [
      {name: 'version', maxLength: 7},
      {name: 'timestamp', maxLength: 19},
      {name: 'deployer', maxLength: 10},
      {name: 'revision', maxLength: -1}
    ];
    var presentKeys = [];
    keys.forEach(function(key) {
      if(this._hasKey(key.name, revisions)) {
        presentKeys.push(key);
      }
    }.bind(this));
    return presentKeys;
  },

  _displayHeader: function(keys) {
    var keyHeader = " ";
    var lastKey = keys[keys.length - 1];

    keys.forEach(function(key) {
      var shortKey = key.maxLength === -1 ? key.name : key.name.substr(0, key.maxLength);
      keyHeader += " " + shortKey + " ";

      var fillerLength = key.maxLength === -1 ? 0 : key.maxLength - shortKey.length;
      for(var i = 0; i < fillerLength; i++) {
        keyHeader += " ";
      }

      // revision hash needs an unknown amount of space, don't display closing |
      if(key !== lastKey) {
        keyHeader += "|";
      }
    });
    this.log(keyHeader);

    var underline = "";
    for(var i = 0; i < keyHeader.length; i++) {
      underline += "=";
    }
    this.log(underline);
  },
  _hasKey: function(key, revisions) {
    return revisions.some(function(revision) {
      return Object.keys(revision).indexOf(key) !== -1;
    });
  }
});
