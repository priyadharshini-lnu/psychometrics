const MockResults = {
  EmbeddedData: [{
    value: 'ReactJS',
  }, {
    value: 'RoR',
  }, {
    value: 'ReactJS',
  }, {
    value: 'ruby',
  }, {
    value: 'RoR',
  }],
  Factor: {
    111: {
      name: 'Drive',
      results: [{
        value: 5,
      }, {
        value: 5,
      }, {
        value: 6,
      }, {
        value: 6,
      }, {
        value: 6,
      }],
    },
    222: {
      name: 'Zest',
      results: [{
        value: 3,
      }, {
        value: 2,
      }, {
        value: 1,
      }, {
        value: 6,
      }, {
        value: 2,
      }],
    },
    333: {
      name: 'Abs',
      results: [{
        value: 3,
      }, {
        value: 4,
      }, {
        value: 3,
      }, {
        value: 4,
      }, {
        value: 4,
      }],
    },
  },
  ConstantSum: [
    [{
      index: 0, value: 30,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 50,
    }],
    [{
      index: 0, value: 90,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 40,
    }],
    [{
      index: 0, value: 30,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 60,
    }],
  ],
  GraphicSlider: [
    [{
      value: 2,
    }],
    [{
      value: 5,
    }],
    [{
      value: 5,
    }],
  ],
  HotSpot: [
    [{
      region: 1, value: false,
    }, {
      region: 0, value: true,
    }, {
      region: 2, value: true,
    }, {
      region: 3, value: true,
    }],
    [{
      region: 1, value: true,
    }, {
      region: 0, value: null,
    }, {
      region: 2, value: true,
    }, {
      region: 3, value: true,
    }],
    [{
      region: 1, value: true,
    }, {
      region: 0, value: null,
    }, {
      region: 2, value: true,
    }, {
      region: 3, value: true,
    }],
  ],
  MultipleChoice: [
    [{
      index: 1, value: true,
    }, {
      index: 0, value: true,
    }],
    [{
      index: 2, value: true,
    }, {
      index: 1, value: true,
    }],
    [{
      index: 2, value: true,
    }, {
      index: 1, value: true,
    }],
  ],
  RankOrder: [
    [{
      index: 2, value: 0,
    }, {
      index: 0, value: 1,
    }, {
      index: 1, value: 2,
    }],
    [{
      index: 2, value: 1,
    }, {
      index: 0, value: 0,
    }, {
      index: 1, value: 2,
    }],
  ],
  Slider: [
    [{
      index: 0, value: 20,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 50,
    }],
    [{
      index: 0, value: 10,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 40,
    }],
    [{
      index: 0, value: 30,
    }, {
      index: 1, value: 30,
    }, {
      index: 2, value: 60,
    }],
  ],
  GapAnalysis: [
    [{
      scale: 3, choice: 2, values: [1],
    }, {
      scale: 2, choice: 1, values: [2],
    }, {
      scale: 1, choice: 0, values: [0],
    }],
    [{
      scale: 4, choice: 0, values: [1, 2],
    }, {
      scale: 3, choice: 2, values: [2, 0],
    }, {
      scale: 2, choice: 1, values: [0, 1],
    }],
  ],
  Timing: [
    {
      firstClick: 1, lastClick: 10, pageSubmit: 12, clickCount: 10,
    }, {
      firstClick: 2, lastClick: 9, pageSubmit: 10, clickCount: 7,
    }, {
      firstClick: 5, lastClick: 20, pageSubmit: 25, clickCount: 2,
    },
  ],
  PickGroupRank: [
    [{
      scale: 2, choice: 2, value: 1,
    }, {
      scale: 0, choice: 1, value: 2,
    }, {
      scale: 1, choice: 0, value: 0,
    }],
    [{
      scale: 0, choice: 0, value: 2,
    }, {
      scale: 1, choice: 2, value: 1,
    }, {
      scale: 2, choice: 1, value: 0,
    }],
    [{
      scale: 0, choice: 0, value: 1,
    }, {
      scale: 2, choice: 2, value: 2,
    }, {
      scale: 1, choice: 1, value: 0,
    }],
  ],
  TextEntry: [
    [{
      value: 'Javascript',
    }, {
      value: 'React',
    }, {
      value: 'Ruby',
    }],
    [{
      value: 'Ruby on Rails',
    }],
    [{
      value: 'Java',
    }, {
      value: 'C#',
    }, {
      value: 'React',
    }],
    [{
      value: 'React',
    }, {
      value: 'React',
    }, {
      value: 'Ruby on Rails',
    }],
    [{
      value: 'react native',
    }, {
      value: 'C++',
    }, {
      value: 'php',
    }, {
      value: 'android',
    }],
  ],

  MatrixTable: [
    [{
      scale: 2, choice: 2, value: 1,
    }, {
      scale: 0, choice: 1, value: 2,
    }, {
      scale: 1, choice: 0, value: 0,
    }],
    [{
      scale: 0, choice: 0, value: 2,
    }, {
      scale: 1, choice: 2, value: 1,
    }, {
      scale: 2, choice: 1, value: 0,
    }],
    [{
      scale: 0, choice: 0, value: 1,
    }, {
      scale: 2, choice: 2, value: 2,
    }, {
      scale: 1, choice: 1, value: 0,
    }],
  ],

  DataSheet: [5, 7, 8, 4, 2, 1],
  ExternalFactor: [5, 7, 8, 4, 2, 1],
}
export default MockResults
