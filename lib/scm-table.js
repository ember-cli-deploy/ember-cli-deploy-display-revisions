var Table = require('cli-table2');
var moment = require('moment');
var CoreObject = require('core-object');
var RSVP = require('rsvp');

module.exports = CoreObject.extend({
  init: function(plugin, revisions) {
    this._super(plugin, revisions);

    this._plugin = plugin;
    this.revisions = revisions;
  },

  display: function(/* revisions */) {
    var table = this._createTable();
    this._tableRows(table);

    this._plugin.logRaw(table.toString());
    return RSVP.resolve();
  },

  _isWide: function() {
    return process.stdout.columns >= 98;
  },

  _tableHeader: function() {
    var head = ['RevisionKey', 'Commit', 'User', 'Branch'];

    if (this._isWide()) {
      head.push('Deploy time');
    }
    return head;
  },

  _createTable: function() {
    var head = this._tableHeader();

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

  _tableRows: function(table) {
    this.revisions.forEach(function(revision) {
      var data = revision.revisionData;

      var row = [
        ((revision.active) ? '> ' : '  ') + data.revisionKey,
        data.scm.sha.substr(0,8),
        data.scm.email,
        data.scm.branch,
      ];

      if (this._isWide()) {
        var value = moment(data.timestamp).format("YYYY/MM/DD HH:mm:ss");
        row.push(value);
      }

      table.push(row);

    }.bind(this));
  },

});
