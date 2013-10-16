/*exported webAudioTest */



/**
 * [webAudioTest Web Audio API compatability tests]
 * @param  Window window [description]
 * @return Object The module
 */

function webAudioTest(window) {

  var document = window.document;

  var helper = {
    audioContext: window.AudioContext || window.webkitAudioContext,
    createAudioContext: function() {
      return new this.audioContext();
    },
    createOscillator: function() {
      return this.createAudioContext().createOscillator();
    },
    AudioContextContains: function(property) {
      return (property in this.createAudioContext());
    }
  };

  var resultType = {
    pass: 0,
    fail: 1,
    ignore: 2,
    error: 3,
    header: 4
  };

  // Create an inverse map to convert from name to type
  var resultName = {};
  for (var resultTypeKey in resultType) {
    resultName[resultType[resultTypeKey]] = resultTypeKey;
  }

  /**
   * The test suite to be run
   */
  var testSuite = {
    desc: 'Is there any support for the Web Audio API (through AudioContext or webKitAudioContext)',
    test: function() {
      return (typeof helper.audioContext) !== 'undefined';
    },
    subTests: {
      'AudioContext': {
        desc: 'AudioContext function exists',
        test: function() {
          return ('AudioContext' in window);
        }
      },
      'webKitAudioContext': {
        desc: 'webkitAudioContext function exists (old API)',
        test: function() {
          return ('webkitAudioContext' in window);
        }
      },
      'createOscillator': {
        desc: 'audioContext contains createOscillator()',
        test: function() {
          return helper.AudioContextContains('createOscillator');
        },
        subTests: {
          'start': {
            desc: 'oscillator object contains start()',
            test: function() {
              return ('start' in helper.createAudioContext().createOscillator());
            }
          },
          'typeAsEnum': {
            desc: 'createOscillator exposes "type" property as an enumerated string',
            test: function() {
              return (typeof helper.createAudioContext().createOscillator().type === 'string');
            }
          }
        },
      },
      'createGain': {
        desc: 'audio context contains createGain()',
        test: function() {
          return helper.AudioContextContains('createGain');
        }
      },
      'createDelay': {
        desc: 'audio context contains createDelay()',
        test: function() {
          return helper.AudioContextContains('createDelay');
        }
      },
      'createScriptProcessor': {
        desc: 'audio context contains createScriptProcessor()',
        test: function() {
          return helper.AudioContextContains('createScriptProcessor');
        },
      },
      'oldAPI': {
        desc: 'Old (deprecated) API support',
        subTests: {
          'createGainNode': {
            test: function() {
              return helper.AudioContextContains('createGainNode');
            }
          },
          'createDelayNode': {
            test: function() {
              return helper.AudioContextContains('createDelayNode');
            }
          },
          'createJavascriptNode': {
            test: function() {
              return helper.AudioContextContains('createJavascriptNode');
            }
          }

        }
      }

    } // testsuite-subtests
  }; //testSuite


  /**
   * Run the test suite
   * @return Object the test results
   */

  function runTests() {
    function runTest(test, testName, ignore) {
      var error = null;
      var result;
      if (ignore) {
        result = resultType['ignore'];
      } else if (test.test) {
        try {
          result = test.test();
          if (result === true || result === false) {
            result = result ? resultType['pass'] : resultType['fail'];
          }
        } catch (ex) {
          error = ex;
          result = resultType['error'];
        }
      } else {
        result = resultType['header'];
      }

      results.push({
        name: testName,
        result: result,
        error: error,
        desc: test.desc
      });

      // execute sub tests
      if (test.subTests) {
        var ignoreSub = (result !== resultType['pass'] && result !== resultType['header']);
        var subTestKey;
        for (subTestKey in test.subTests) {
          if (test.subTests.hasOwnProperty(subTestKey)) {
            var subTestName = testName ? testName + '_' + subTestKey : subTestKey;
            runTest(test.subTests[subTestKey], subTestName, ignoreSub);
          }
        }
      }
    }

    var results = [];
    runTest(testSuite, '');
    //Hackish
    results[0].name = 'Web Audio API';
    return results;
  }

  /**
   * Create an html report for the given result
   * @param  {Object} results     results to create the report for
   * @param  {DomElement} placeHolder where to put the results
   * @return {void}
   */

  function createReport(results, placeHolder) {

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
      return '---';
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
   * @param  {Object} results
   * @param  {Object} ga Google Analytics queue object (normaly window.ga)
   * @return {void}
   */
  function reportToGoogleAnalytics(results, ga) {
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.result !== resultType['header']) {
        //category, action, opt_label, opt_value, opt_noninteraction
        ga('send', 'event', 'WebAudioCompatability', result.name, resultName[result.result]);
      }
    }
  }


  /**
   * Exports
   */
  return {
    runTests: runTests,
    reportToBrowserScope: reportToBrowserScope,
    createReport: createReport,
    reportToGoogleAnalytics: reportToGoogleAnalytics
  };

}