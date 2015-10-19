/* jshint node: true */
'use strict';

var DeployPluginBase = require('ember-cli-deploy-plugin');
var moment = require('moment');

module.exports = {
  name: 'ember-cli-deploy-display-revisions',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        amount: function(context) {
          return context.commandOptions.amount || 10;
        },
      },

      displayRevisions: function(context) {
        if(!context.revisions) {
          this.log("Could not display latest revisions because no revisions were found in context.", {color: 'yellow'});
          return;
        }

        var revisions = context.revisions.slice(0, this.readConfig("amount"));

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
            row += "|"
          }
        });

        this.log(row);
      },
      _getKeys: function(revisions) {
        var keys = [{name: 'version', maxLength: 7}, {name: 'timestamp', maxLength: 19}, {name: 'deployer', maxLength: 10}, {name: 'revision', maxLength: -1}];
        var presentKeys = [];
        keys.forEach(function(key) {
          if(this._hasKey(key.name, revisions)) {
            presentKeys.push(key);
          }
        }.bind(this));
        return presentKeys;
      },
      _displayHeader: function(keys, revisions) {
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
            keyHeader += "|"
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

    return new DeployPlugin();
  }
};
