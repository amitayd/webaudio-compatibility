/*exported main */
/*globals webAudioTest, _gaq */

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
  var tester = webAudioTest(window);
  var runResults = tester.runTests();
  tester.createReport(runResults, document.getElementById('results'));
  // Prevent running the tests on development
  if (window.location.host.indexOf(settings.liveDomain) >= 0) {
    tester.reportToBrowserScope(runResults, settings.browserScopeKey, settings.sandBoxId);
    tester.reportToGoogleAnalytics(runResults, ga);
  }

  if (settings.browserScopeContainerId) {
    var newScript = document.createElement('script'),
      container = document.getElementById(settings.browserScopeContainerId);
    newScript.src = 'http://www.browserscope.org/user/tests/table/' + settings.browserScopeKey + '?o=js&v=3';
    container.appendChild(newScript);
  }
}