/*exported main */
/*globals CompatabilityTests, ga */

/**
 * [main description]
 * @param  {Object} settings object with the following properties
 *                    browserScopeKey: key for the test
 *                    sandBoxId: (optional) browserscope sandbox id
 *                    liveDomain: domain that only if current location is in it the results will be sent to
 *                                browserscope (intended to disable sending requests while developing)
 *                    browserScopeKey: key for the test
 *                    browserScopeContainerId: where to show the browserscope results
 * @return {void}
 */

function main(settings) {

  var tester = CompatabilityTests.Tester;
  var reporters = CompatabilityTests.Reporters;

  var testSuite = tester.createTestSuite('Web Audio API', CompatabilityTests.WebAudioSpec );
  var runResults = tester.runTests(testSuite, 'Web Audio API');
  reporters.reportToDom(runResults, document.getElementById('results'));
  // Prevent running the tests on development
  if (window.location.host.indexOf(settings.liveDomain) >= 0) {
    var resultsKv = reporters.toKeyValue(runResults);
    reporters.reportToBrowserScope(resultsKv, settings.browserScopeKey, settings.sandBoxId);
    reporters.reportToGoogleAnalytics(runResults, ga);
  }

  //load browser scope results
  if (settings.browserScopeContainerId) {
    var newScript = document.createElement('script'),
      container = document.getElementById(settings.browserScopeContainerId);
    newScript.src = 'http://www.browserscope.org/user/tests/table/' + settings.browserScopeKey + '?o=js&v=3';
    container.appendChild(newScript);
  }
}