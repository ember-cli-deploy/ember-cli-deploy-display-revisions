/*jshint globalstrict: true*/
'use strict';

var moment = require('moment');

var chai  = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var assert = chai.assert;

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

        assert.equal(messages.length, 2);
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
        assert.equal(messages.length, 1);
      });
    });
  });
  describe('displayRevisions hook with revisionData', function() {
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
          { revision: "rev:first", revisionData: {revisionKey: 'rev:first', scm: {sha: '99ee96e7ee7d36717524bd6489d2eff966c83c3d', email: 'mattia@mail.com', branch: 'foo'}, timestamp: 1032123125000}},
          { revision: "rev:second", revisionData: {revisionKey: 'rev:second', scm: {sha: 'eeee96e7ee7d36717524bd6489d2eff966c83c3d', email: 'aaron@mail.com', branch: 'bar'}, timestamp: 1032123127000}},
          { revision: "rev:third", revisionData: {revisionKey: 'rev:third', scm: {sha: 'ffee96e7ee7d36717524bd6489d2eff966c83c3d', email: 'luke@mail.com', branch: 'foo'}, timestamp: 1032123128000}},
        ]
      };
      plugin.beforeHook(context);
      plugin.configure(context);
    });

    it('lists revisions', function() {
      plugin.displayRevisions(context);
      var messages = mockUi.messages.reduce(function(previous, current) {
        if (current.indexOf("rev:") !== -1) {
          previous.push(current);
        }

        return previous;
      }, []);
      assert.equal(messages.length, 1); // logs a single message as table
      var message = messages[0];
      assert.match(message, /RevisionKey/);
      assert.match(message, /Commit/);
      assert.match(message, /User/);
      assert.match(message, /Branch/);

      var lines = message.split("\n");
      assert.equal(lines.length, 4); // logs headers and 3 revisions
      var revisionLine = lines[1];
      assert.match(revisionLine, /rev:first/);
      assert.match(revisionLine, /mattia@mail.com/);
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
