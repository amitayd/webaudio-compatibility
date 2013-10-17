(function() {
  /**
   * [webAudioTest Web Audio API compatability tests]
   * @param  Window window [description]
   * @return Object The module
   */


  var createTestFromDefinition = function(propertyName, definition, parentName, objectConstructors) {
    var propertyFullName = parentName + '.' + propertyName;

    var possibleProperties = [propertyName].concat(
      definition.alternativeNames ? definition.alternativeNames : []);
    var desc = possibleProperties.join(' or ') + ' exists in ' + parentName;

    var findProperty = function() {
      var parent = objectConstructors[parentName]();
      for (var i = 0; i < possibleProperties.length; i++) {
        if (possibleProperties[i] in parent) {
          return possibleProperties[i];
        }
      }
      return false;
    };

    var construct = function() {
      var parent = objectConstructors[parentName]();
      var propertyName = findProperty();
      if (definition.useNew) {
        // TODO: support arugments
        return new parent[propertyName]();
      } else {
        return parent[propertyName].apply(parent, arguments);
      }
    };

    objectConstructors[propertyFullName] = construct;

    var testFunction = function() {
      return findProperty() !== false;
    };

    var createdTest = {
      desc: desc,
      test: testFunction,
      subTests: {}
    };

    for (var subProperty in definition.instanceProperties) {
      if (definition.instanceProperties.hasOwnProperty(subProperty)) {
        var propDefinition = definition.instanceProperties[subProperty];
        createdTest.subTests[subProperty] = createTestFromDefinition(subProperty, propDefinition, propertyFullName, objectConstructors);
      }
    }

    // TODO: could use something like underscore's partials instead
    var createPartial = function(func) {
      return function() {
        return func(objectConstructors);
      };
    };

    for (var customTest in definition.customTests) {
      if (definition.customTests.hasOwnProperty(customTest)) {
        var customDefinition = definition.customTests[customTest];
        createdTest.subTests[customTest] = {
          desc: customDefinition.desc,
          test: createPartial(customDefinition.test)
        };
      }
    }

    if (definition.alternativeNames) {
      createdTest.subTests['correctName'] = {
        test: function() {
          return findProperty() === propertyName;
        },
        desc: 'Correct name (' + propertyName + ') is used.'
      };
    }


    return createdTest;
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
   * Run the test suite
   * @return Object the test results
   */

  function runTests(testSuite) {
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



  var createTestSuite = function(name, definitions) {
    var suite = {
      subTests: {}
    };

    var objects = {
      window: function() {
        return window;
      }
    };
    for (name in definitions) {
      if (definitions.hasOwnProperty(name)) {
        suite.subTests[name] = createTestFromDefinition(name, definitions[name], 'window', objects);
      }
    }

    return suite;
  };


  /**
   * Exports
   */
  window.CompatabilityTests = window.CompatabilityTests || {};
  window.CompatabilityTests.Tester = {
    createTestSuite: createTestSuite,
    runTests: runTests,
    resultType: resultType,
    resultName: resultName
  };

})();