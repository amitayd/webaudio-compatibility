/*globals CompatabilityTests */

(function(tester) {

  // Aliases
  var resultType = tester.resultType;
  var resultName = tester.resultName;

    /**
   * Create an html report for the given result
   * @param  {Object} results     results to create the report for
   * @param  {DomElement} placeHolder where to put the results
   * @return {void}
   */
  function reportToDom(results, placeHolder) {

    function appendElement(parent, tag, text, className) {
      var el = document.createElement(tag);
      if (text) {
        var textNode = document.createTextNode(text);
        el.appendChild(textNode);
      }
      el.className = className;
      parent.appendChild(el);
      return el;
    }

    function tryToString(obj) {
      if (obj && obj.toString) {
        return obj.toString();
      }
      return '';
    }

    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var resultEl = appendElement(placeHolder, 'div', null, 'bar');
      var resultResult = resultName[result.result];
      // TODO: Ugly, extend the resultName to hold richer data.
      if (resultResult === 'header') {
        resultResult = '';
      }
      appendElement(resultEl, 'span', result.name, 'name');
      appendElement(resultEl, 'span', resultResult, 'result ' + resultResult);
      appendElement(resultEl, 'span', tryToString(result.desc), 'description');
      appendElement(resultEl, 'span', tryToString(result.error), 'errorDetails');
    }
  }


  /**
   * Send results to browserScope
   * @param  {Object} results   results to send
   * @param  {String} testKey   test key
   * @param  {String} sandBoxId sandBoxId (optional)
   * @return the sent results object
   */

  function reportToBrowserScope(results, testKey, sandBoxId) {
    // convert the results to browserScope Key-Value
    var bsResults = {};
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.result !== resultType['header']) {
        // Failed by default
        var bsResult = 0;
        // Only if passed then 1
        if (result.result === resultType['pass']) {
          bsResult = 1;
        }
        bsResults[result.name] = bsResult;
      }
    }

    // browser scope script uses this global
    window._bTestResults = bsResults;
    console.log('bsResults', bsResults);

    var newScript = document.createElement('script'),
      firstScript = document.getElementsByTagName('script')[0];
    newScript.src = 'http://www.browserscope.org/user/beacon/' + testKey;
    if (sandBoxId) {
      newScript.src += '?sandboxid=' + sandBoxId;
    }
    firstScript.parentNode.insertBefore(newScript, firstScript);

  }

  /**
   * log the results to window analytics
   *
   * @param  {Object} results
   * @param  {Object} ga Google Analytics queue object (normaly window.ga)
   * @return {void}
   */

  function reportToGoogleAnalytics(results, ga) {
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.result !== resultType['header']) {
        //category, action, opt_label, opt_value, opt_noninteraction]
        var value = (result.result === resultType['pass']) ? 1 : 0;
        ga('send', 'event', 'WebAudioCompatability', result.name, resultName[result.result], value);
      }
    }
  }


  // Exports
  window.CompatabilityTests = window.CompatabilityTests || {};
  window.CompatabilityTests.Reporters = {
    reportToGoogleAnalytics: reportToGoogleAnalytics,
    reportToBrowserScope: reportToBrowserScope,
    reportToDom: reportToDom
  };

})(CompatabilityTests.Tester);