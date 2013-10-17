/*globals describe, it, expect ,CompatabilityTests */

describe("APITeser", function() {
  var tester = CompatabilityTests.Tester;
  var reporters = CompatabilityTests.Reporters;
  var apiSpec = {
    'Root1': {
      instanceProperties: {
        'Child1': {
          instanceProperties: {
            'r1c1m1': {},
            'r1c1m2': {}
          }
        },
        'Child2': {
          alternativeNames: ['ChildTwo'],
        }
      }
    },
    'Root2': {}
  };

  var apiSuite = tester.createTestSuite('test', apiSpec);
  var apiResult = tester.runTests(apiSuite, 'test');
  var apiResultKV = reporters.toKeyValue(apiResult);

  it("suite created", function() {
    expect(apiSuite.subTests.Root1).toBeDefined();
  });

  it("result created", function() {
    expect(apiResult.subTests.length).toEqual(2);
  });

  it("result convertedToKV", function() {
    expect(apiResultKV['Root1'].resultName).toEqual('fail');
    expect(apiResultKV['Root1.Child1.r1c1m1'].resultName).toEqual('ignore');
  });
  
});