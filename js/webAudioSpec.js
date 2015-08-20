(function() {
  var webAudioSpec = {
    'AudioContext': {
      useSingle: true,
      useNew: true,
      alternativeNames: ['webkitAudioContext'],
      operations: {
        'createOscillator': {
          operations: {
            'start': {},
            'type': {
              customTests: {
                'isEnum': {
                  desc: '"type" property as an enumerated string',
                  test: function(objects) {
                    return typeof objects['window.AudioContext.createOscillator']().type === 'string';
                  }
                }
              }
            }
          }
        },
        'createGain': {
          alternativeNames: ['createGainNode']
        },
        'createDelay': {
          alternativeNames: ['createDelayNode']
        },
        'createScriptProcessor': {
          alternativeNames: ['createJavaScriptNode']
        },
        'destination': {},
        'sampleRate': {},
        'currentTime': {},
        'listener': {},
        'createBuffer': {},
        'decodeAudioData': {},
        'createBufferSource': {},
        'createMediaElementSource': {},
        'createMediaStreamSource': {},
        'createAnalyser': {},
        'createMediaStreamDestination': {},
        'createBiquadFilter': {},
        'createWaveShaper': {},
        'createPanner': {},
        'createConvolver': {},
        'createChannelSplitter': {},
        'createChannelMerger': {},
        'createDynamicsCompressor': {},
        'createPeriodicWave': {
          alternativeNames: ['createWaveTable']
        }
      }
    }
  };


  window.CompatibilityTests = window.CompatibilityTests || {};
  window.CompatibilityTests.WebAudioSpec = webAudioSpec;

})();