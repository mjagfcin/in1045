module.exports = {
  default: {
    require: ['tests/cucumber/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html'],
    paths: ['tests/cucumber/features/**/*.feature'],
    dryRun: false,
    failFast: false,
    parallel: 1,
  },
};
