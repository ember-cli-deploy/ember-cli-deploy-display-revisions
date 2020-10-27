const Table = require('cli-table3');
const { DateTime } = require('luxon');
const CoreObject = require('core-object');
const RSVP = require('rsvp');

module.exports = CoreObject.extend({
  init(plugin, revisions) {
    this._super(plugin, revisions);

    this._plugin = plugin;
    this.revisions = revisions;
  },

  display(/* revisions */) {
    let table = this._createTable();
    this._tableRows(table);

    this._plugin.logRaw(table.toString());
    return RSVP.resolve();
  },

  _isWide() {
    return process.stdout.columns >= 98;
  },

  _tableHeader() {
    let head = ['RevisionKey', 'Commit', 'User', 'Branch'];

    if (this._isWide()) {
      head.push('Deploy time');
    }
    return head;
  },

  _createTable() {
    let head = this._tableHeader();

    return new Table({
      head: head,
      wordWrap: true,
      chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '',
        'mid': '',
        'middle': '',
        'mid-mid': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'right': '',
        'right-mid': ''
      }
    });
  },

  _tableRows(table) {
    this.revisions.forEach(function(revision) {
      let data = revision.revisionData;

      let row = [
        ((revision.active) ? '> ' : '  ') + data.revisionKey,
        data.scm.sha.substr(0,8),
        data.scm.email,
        data.scm.branch,
      ];

      if (this._isWide()) {
        let { timestamp } = data;
        // ember-cli-deploy-revision-data provides a JS Date object, so fall back to that if not milliseconds
        let dt = typeof timestamp === 'number' ? DateTime.fromMillis(timestamp) : DateTime.fromJSDate(timestamp);
        let value = dt.toFormat('yyyy/MM/dd HH:mm:ss');
        row.push(value);
      }

      table.push(row);

    }.bind(this));
  },

});
