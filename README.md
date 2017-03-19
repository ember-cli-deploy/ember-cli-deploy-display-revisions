# Ember-cli-deploy-display-revisions

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-display-revisions.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

Display a list of deployed revisions using [ember-cli-deploy](https://github.com/ember-cli/ember-cli-deploy). This plugin is for `ember-cli-deploy` >= 0.5.0.

## Installation

* `ember install ember-cli-deploy-display-revisions`

## Configuration Options

### Defaults

```
  ENV['display-revisions'] = {
    amount: 10,
    revisions: function(context) {
      return context.revisions;
    }
  }
```

### amount

Number of revisions displayed in the results table

*Default:* `10`

### revisions

The data to be displayed

*Default:* `context.revisions`, usually received from `fetchRevisions`

## Usage

* `ember deploy:list <environment>` to list the latest 10 revisions
* `ember deploy:list --amount <N> <environment>` to list the latest <N> revisions

## Passing revisions

`ember-cli-deploy-display-revisions` expects the `fetchRevisions` to be implemented by your index plugin, filling the `revisions` variable in context in the following format:

```
[
  {
    revision: 'abc123', // mandatory
    version: 'v1',
    timestamp: 1438232435000, // milliseconds since epoch
    deployer: 'cats'
  },
  {
    revision: 'def456',
    version: 'v2',
    timestamp: 1032123128000,
    deployer: 'dogs',
    active: true // indicate whether this revision is activated
  }
]
```

Omitted keys are not displayed in listing the results.

## Tests

* yarn test

## Why `ember build` and `ember test` don't work

Since this is a node-only ember-cli addon, this package does not include many files and dependencies which are part of ember-cli's typical `ember build` and `ember test` processes.
