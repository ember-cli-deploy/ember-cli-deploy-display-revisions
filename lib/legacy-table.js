let { DateTime } = require('luxon');
let CoreObject = require('core-object');

module.exports = CoreObject.extend({
  init(plugin, revisions) {
    this._super(plugin, revisions);

    this._plugin = plugin;
    this.revisions = revisions;
  },

  log() {
    this._plugin.log.apply(this._plugin, arguments);
  },

  display() {
    let revisions = this.revisions;
    let keys = this._getKeys(revisions);

    this._displayHeader(keys, revisions);

    revisions.forEach(function(revision) {
      this._displayRow(keys, revision);
    }.bind(this));
  },

  _displayRow(keys, revision) {
    let row = "";
    if(revision.active) {
      row += ">";
    } else {
      row += " ";
    }

    let lastKey = keys[keys.length - 1];

    keys.forEach(function(key) {
      let value = revision[key.name] ? revision[key.name] : "";

      if(key.name === 'timestamp') {
        // ember-cli-deploy-revision-data provides a JS Date object, so fall back to that if not milliseconds
        let dt = typeof value === 'number' ? DateTime.fromMillis(value) : DateTime.fromJSDate(value);
        value = dt.toFormat("yyyy/MM/dd HH:mm:ss");
      }

      if(key.maxLength !== -1) {
        value = String(value).substr(0, key.maxLength);
      }

      row += " " + value + " ";

      let fillerLength = key.maxLength - value.length;
      for(let i = 0; i < fillerLength; i++) {
        row += " ";
      }
      if(key !== lastKey) {
        row += "|";
      }
    });

    this.log(row);
  },

  _getKeys(revisions) {
    let keys = [
      {name: 'version', maxLength: 7},
      {name: 'timestamp', maxLength: 19},
      {name: 'deployer', maxLength: 10},
      {name: 'revision', maxLength: -1}
    ];
    let presentKeys = [];
    keys.forEach(function(key) {
      if(this._hasKey(key.name, revisions)) {
        presentKeys.push(key);
      }
    }.bind(this));
    return presentKeys;
  },

  _displayHeader(keys) {
    let keyHeader = " ";
    let lastKey = keys[keys.length - 1];

    keys.forEach(function(key) {
      let shortKey = key.maxLength === -1 ? key.name : key.name.substr(0, key.maxLength);
      keyHeader += " " + shortKey + " ";

      let fillerLength = key.maxLength === -1 ? 0 : key.maxLength - shortKey.length;
      for(let i = 0; i < fillerLength; i++) {
        keyHeader += " ";
      }

      // revision hash needs an unknown amount of space, don't display closing |
      if(key !== lastKey) {
        keyHeader += "|";
      }
    });
    this.log(keyHeader);

    let underline = "";
    for(let i = 0; i < keyHeader.length; i++) {
      underline += "=";
    }
    this.log(underline);
  },
  _hasKey(key, revisions) {
    return revisions.some(function(revision) {
      return Object.keys(revision).indexOf(key) !== -1;
    });
  }
});
