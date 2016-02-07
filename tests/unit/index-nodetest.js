/*jshint globalstrict: true*/
'use strict';

var RSVP   = require('ember-cli/lib/ext/promise');
var moment = require('moment');

var assert = require('ember-cli/tests/helpers/assert');

describe('displayRevisions plugin', function() {
  var subject, mockUi, config;

  beforeEach(function() {
    subject = require('../../index');
    mockUi = {
      verbose: true,
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    var plugin = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(plugin.name, 'test-plugin');
  });

  it('implements the correct hooks', function() {
    var plugin = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(typeof plugin.displayRevisions, 'function');
  });

  describe('configure hook', function() {
    var plugin, context;
    describe('without providing config', function () {
      beforeEach(function() {
        config = { };
        plugin = subject.createDeployPlugin({
          name: 'displayRevisions'
        });
        context = {
          ui: mockUi,
          config: config
        };
        plugin.beforeHook(context);
      });
      it('warns about missing optional config', function() {
        plugin.configure(context);
        var messages = mockUi.messages.reduce(function(previous, current) {
          if (/- Missing config:\s.*, using default:\s/.test(current)) {
            previous.push(current);
          }

          return previous;
        }, []);

        assert.equal(messages.length, 1);
      });

      it('adds default config to the config object', function() {
        plugin.configure(context);
        assert.isDefined(config.displayRevisions.amount);
      });
    });

    describe('with an amount provided', function () {
      beforeEach(function() {
        config = {
          displayRevisions: {
            amount: 20
          }
        };
        plugin = subject.createDeployPlugin({
          name: 'displayRevisions'
        });
        context = {
          ui: mockUi,
          config: config
        };
        plugin.beforeHook(context);
      });
      it('does not warn about missing optional config', function() {
        plugin.configure(context);
        var messages = mockUi.messages.reduce(function(previous, current) {
          if (/- Missing config:\s.*, using default:\s/.test(current)) {
            previous.push(current);
          }

          return previous;
        }, []);
        assert.equal(messages.length, 0);
      });
    });
  });

  describe('displayRevisions hook', function() {
    var plugin, context;

    beforeEach(function() {
      plugin = subject.createDeployPlugin({
        name: 'display-revisions'
      });

      context = {
        ui: mockUi,
        config: { },
        commandOptions: {
          amount: 3
        },
        revisions: [
          { revision: "rev:abcdef", timestamp: 1438232435000, deployer: "My Hamster"},
          { revision: "rev:defghi", timestamp: 1032123125000, deployer: "My Hamster", active: true},
          { revision: "rev:jklmno", timestamp: 1032123128000, deployer: "My Hamster"},
          { revision: "rev:qrstuv", timestamp: 1032123155000, deployer: "My Hamster"},
          { revision: "rev:xyz123", timestamp: 1032123123000, deployer: "My Hamster"}
        ]
      };
      plugin.beforeHook(context);
      plugin.configure(context);
    });

    it('lists revisions limited by the amount specified', function() {
      plugin.displayRevisions(context);
      var messages = mockUi.messages.reduce(function(previous, current) {
        if (current.indexOf("rev:") !== -1) {
          previous.push(current);
        }

        return previous;
      }, []);
      assert.equal(messages.length, 3);
    });

    it('skips unset keys', function() {
      plugin.displayRevisions(context);
      var messages = mockUi.messages.reduce(function(previous, current) {
        if (/ version /.test(current)) {
          previous.push(current);
        }

        return previous;
      }, []);
      assert.equal(messages.length, 0);
    });

    it('transforms timestamps to human-readable dates (YYYY/MM/DD HH:mm:ss)', function() {
      plugin.displayRevisions(context);
      var expectedFormat = ('YYYY/MM/DD HH:mm:ss');
      var expectedDate   = moment(1438232435000).format(expectedFormat);

      var messages = mockUi.messages.reduce(function(previous, current) {
        if (current.indexOf(expectedDate) !== -1) {
          previous.push(current);
        }

        return previous;
      }, []);
      assert.equal(messages.length, 1);
    });

    it('highlights the active revision', function() {
      plugin.displayRevisions(context);
      var messages = mockUi.messages.reduce(function(previous, current) {
        if (current.indexOf(">") !== -1) {
          previous.push(current);
        }

        return previous;
      }, []);
      assert.equal(messages.length, 1);
    });
  });
});
