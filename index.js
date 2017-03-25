'use strict';

var DeployPluginBase = require('ember-cli-deploy-plugin');
var ScmTable = require('./lib/scm-table');
var LegacyTable = require('./lib/legacy-table');

module.exports = {
  name: 'ember-cli-deploy-display-revisions',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        amount: function(context) {
          return context.commandOptions.amount || 10;
        },

        revisions: function(context) {
          return context.revisions;
        }
      },

      displayRevisions: function(/* context */) {
        var table;
        var revisions = this.readConfig('revisions');
        if(!revisions || revisions.length === 0) {
          this.log("Could not display latest revisions because no revisions were found in context.", {color: 'yellow'});
          return;
        }

        revisions = revisions.slice(0, this.readConfig("amount"));

        var hasRevisionData = revisions.reduce(function(prev, current) {
          return !prev ? false : !!current.revisionData;
        }, true);

        if (hasRevisionData) {
          table = new ScmTable(this, revisions);
        } else {
          table = new LegacyTable(this, revisions);
        }

        table.display();
      }
    });

    return new DeployPlugin();
  }
};
