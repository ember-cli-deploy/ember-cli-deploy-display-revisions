'use strict';

const DeployPluginBase = require('ember-cli-deploy-plugin');
const ScmTable = require('./lib/scm-table');
const LegacyTable = require('./lib/legacy-table');

module.exports = {
  name: 'ember-cli-deploy-display-revisions',

  createDeployPlugin(options) {
    let DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        amount(context) {
          return context.commandOptions.amount || 10;
        },

        revisions(context) {
          return context.revisions;
        }
      },

      displayRevisions(/* context */) {
        let table;
        let revisions = this.readConfig('revisions');
        if(!revisions || revisions.length === 0) {
          this.log("Could not display latest revisions because no revisions were found in context.", {color: 'yellow'});
          return;
        }

        revisions = revisions.slice(0, this.readConfig("amount"));

        let hasRevisionData = revisions.reduce(function(prev, current) {
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
