(function() {


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
    // support a single instance (for when creating multiple instances is a problem,
    // for example with AudioContext instanc elimit)
    if (definition.useSingle) {
      var singletonInstance = construct();
      objectConstructors[propertyFullName] = function() {
        return singletonInstance;
      };
    }

    var testFunction = function() {
      return findProperty() !== false;
    };

    var createdTest = {
      desc: desc,
      test: testFunction,
      subTests: {}
    };

    for (var operationName in definition.operations) {
      if (definition.operations.hasOwnProperty(operationName)) {
        var propDefinition = definition.operations[operationName];
        createdTest.subTests[operationName] = createTestFromDefinition(operationName, propDefinition, propertyFullName, objectConstructors);
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

  /**
   * Run the test suite
   * @return Object the test results
   */

  function runTests(testSuite, name) {
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

      var results = {
        name: testName,
        result: result,
        error: error,
        desc: test.desc,
        subTests: []
      };

      // execute sub tests
      if (test.subTests) {
        var ignoreSub = (result !== resultType['pass'] && result !== resultType['header']);
        var subTestKey;
        for (subTestKey in test.subTests) {
          if (test.subTests.hasOwnProperty(subTestKey)) {
            results.subTests.push(runTest(test.subTests[subTestKey], subTestKey, ignoreSub));
          }
        }
      }

      return results;
    }

    return runTest(testSuite, name);
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
  window.CompatibilityTests = window.CompatibilityTests || {};
  window.CompatibilityTests.Tester = {
    createTestSuite: createTestSuite,
    runTests: runTests,
    resultType: resultType,
    resultName: resultName
  };

})();