/*globals describe, it, expect ,CompatibilityTests, window */

describe("APITeser", function () {
  var tester = CompatibilityTests.Tester;
  var reporters = CompatibilityTests.Reporters;
  var apiSpec = {
    'Root1': {
      operations: {
        'Child1': {
          operations: {
            'r1c1m1': {},
            'r1c1m2': {}
          }
        },
        'Child2': {
          alternativeNames: ['ChildTwo']
        }
      }
    },
    'Root2': {}
  };

  window.Root1 = function() {
    return {'Child2': {}};
  };

  var apiSuite = tester.createTestSuite('test', apiSpec);
  var apiResult = tester.runTests(apiSuite, 'test');
  var apiResultKV = reporters.toKeyValue(apiResult);


  it("suite created", function () {
    expect(apiSuite.subTests.Root1).toBeDefined();
  });

  it("result created", function () {
    expect(apiResult.subTests.length).toEqual(2);
  });

  it("result convertedToKV", function () {
    console.log(apiResultKV);
    expect(apiResultKV['Root1'].resultName).toEqual('pass');
    expect(apiResultKV['Root1.Child1'].resultName).toEqual('fail');
    expect(apiResultKV['Root1.Child1.r1c1m1'].resultName).toEqual('ignore');
    expect(apiResultKV['Root1.Child2'].resultName).toEqual('pass');
  });

});