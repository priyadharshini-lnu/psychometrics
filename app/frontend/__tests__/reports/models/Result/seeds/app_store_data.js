import Occupation from '~/modules/reports/models/Occupation'

export default {
  "id": 190,
  "name": "A.G.I.L.E Report (2)",
  "disabled": false,
  "created_at": "2019-08-28T23:15:37.808+04:00",
  "factor_norms": {
    "109": {
      "eti": [{
        "id": 34358,
        "type": "eti",
        "factor_id": 2335,
        "norm_id": 109,
        "props": [{"level": "Very Low", "score_from": 1, "score_to": 1.5}, {
          "level": "Low",
          "score_from": 1.5,
          "score_to": 1.7
        }, {"level": "Average", "score_from": 1.7, "score_to": 2.4}, {
          "level": "High",
          "score_from": 2.4,
          "score_to": 2.8
        }, {"level": "Very High", "score_from": 2.8, "score_to": 3.2}]
      }, {
        "id": 34359,
        "type": "eti",
        "factor_id": 2336,
        "norm_id": 109,
        "props": [{"level": "Very Low", "score_from": 1, "score_to": 1.5}, {
          "level": "Low",
          "score_from": 1.5,
          "score_to": 2
        }, {"level": "Average", "score_from": 2, "score_to": 3}, {
          "level": "High",
          "score_from": 3,
          "score_to": 3.5,
        }, {"level": "Very High", "score_from": 3.5, "score_to": 6}]
      }, {
        "id": 34360,
        "type": "eti",
        "factor_id": 2350,
        "norm_id": 109,
        "props": [{"level": "Very Low", "score_from": 1, "score_to": 2}, {
          "level": "Low",
          "score_from": 2,
          "score_to": 3
        }, {"level": "Average", "score_from": 3, "score_to": 4}, {
          "level": "High",
          "score_from": 4,
          "score_to": 5
        }, {"level": "Very High", "score_from": 5, "score_to": 6}]
      }],
      "yti": [{
        "id": 34357,
        "type": "yti",
        "factor_id": 776,
        "norm_id": 109,
        "props": [{"score_from": 7, "score_to": null, "level": "Very Low"}, {
          "score_from": null,
          "score_to": null,
          "level": "Low"
        }, {"score_from": null, "score_to": null, "level": "Average"}, {
          "score_from": null,
          "score_to": null,
          "level": "High"
        }, {"score_from": null, "score_to": null, "level": "Very High"}]
      }]
    }
  },
  "filters": [{
    "id": 62,
    "name": "other",
    "conditions": [{"type": "RelationShip", "props": {"predicate": "IsNot", "value": "Manager"}}],
    "assessment_id": 190,
    "min_required_responses": 0
  }, {
    "id": 63,
    "name": "all",
    "conditions": [{"type": "RelationShip", "props": {"predicate": "IsNot", "value": "Peer"}}],
    "assessment_id": 190,
    "min_required_responses": 0
  }, {
    "id": 61,
    "name": "Managers",
    "conditions": [{"type": "RelationShip", "props": {"predicate": "Is", "value": "Manager"}}],
    "assessment_id": 190,
    "min_required_responses": 2
  }],
  "factors": {
    "60": [{
      "id": 2379,
      "name": "2342_sub_1",
      "parent_id": 2342,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2342_sub_1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2380,
      "name": "2342_sub_2",
      "parent_id": 2342,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2342_sub_2",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2381,
      "name": "2342_sub_3",
      "parent_id": 2342,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2342_sub_3",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2385,
      "name": "2349_sub_1",
      "parent_id": 2349,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2349_sub_1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2386,
      "name": "2349_sub_2",
      "parent_id": 2349,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2349_sub_2",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2387,
      "name": "2349_sub_3",
      "parent_id": 2349,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2349_sub_3",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2382,
      "name": "2351_sub_1",
      "parent_id": 2349,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2351_sub_1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2383,
      "name": "2351_sub_2",
      "parent_id": 2351,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2351_sub_2",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2384,
      "name": "2351_sub_3",
      "parent_id": 2351,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "2351_sub_3",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2400,
      "name": "Comp1",
      "parent_id": 2341,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Comp1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2342,
      "name": "Conceptual (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You appreciate learning in an environment where you are allowed to think big, and integrate different concepts by understanding how they fit into the larger picture. In specific situations, you may also find yourself focussing on the task at hand, looking at the finer details without thinking too much about linking the learning to the wider context.",
      "icon": "/uploads/factor/icon/2342/2015_AGILE_icons-CONCEPTUAL.png",
      "alias": "Conceptual (2)",
      "scoring_strategy": "sub_factor_questions",
      "factors_sub_factors": [{"id": 4099, "weight": 1, "name": "2342_sub_1", "sub_factor_id": 2379}, {
        "id": 4100,
        "weight": 1,
        "name": "2342_sub_2",
        "sub_factor_id": 2380
      }, {"id": 4101, "weight": 1, "name": "2342_sub_3", "sub_factor_id": 2381}]
    }, {
      "id": 2341,
      "name": "Contemplative (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You like to take time to consolidate your thoughts in order to maximize your learning. At times you may also find yourself anxious to get on to \"doing\" rather than \"thinking\".",
      "icon": "/uploads/factor/icon/2341/2015_AGILE_icons-CONTEMPLATIVE.png",
      "alias": "Contemplative (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2348,
      "name": "Creative (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Creative (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2346,
      "name": "Critical Thinking (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Critical Thinking (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2347,
      "name": "Curious (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Curious (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2351,
      "name": "Derailer (2)",
      "parent_id": null,
      "question_ids": [17377, 17378],
      "description": "",
      "icon": null,
      "alias": "Derailer (2)",
      "scoring_strategy": "sub_factor_questions",
      "factors_sub_factors": [{"id": 4098, "weight": 1, "name": "2351_sub_3", "sub_factor_id": 2384}]
    }, {
      "id": 2349,
      "name": "Desire to Develop (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Desire to Develop (2)",
      "scoring_strategy": "sub_factor_questions",
      "factors_sub_factors": [{"id": 4102, "weight": 1, "name": "2349_sub_1", "sub_factor_id": 2385}, {
        "id": 4103,
        "weight": 1,
        "name": "2349_sub_2",
        "sub_factor_id": 2386
      }, {"id": 4104, "weight": 1, "name": "2349_sub_3", "sub_factor_id": 2387}]
    }, {
      "id": 2339,
      "name": "Experiential (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You enjoy learning through trial and error using a \"hands - on\" approach to new experiences. At the same time, you are also open to taking the time and doing some research, before plunging in to a new task.",
      "icon": "/uploads/factor/icon/2339/2015_AGILE_icons-EXPERIENTIAL.png",
      "alias": "Experiential (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2401,
      "name": "Flex1",
      "parent_id": 2340,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Flex1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2340,
      "name": "Flexible (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You like to jump right into the task and learn by 'taking is as it comes'. In other times, you may find yourself rely on your favoured learning methods.",
      "icon": "/uploads/factor/icon/2340/2015_AGILE_icons-FLEXIBLE.png",
      "alias": "Flexible (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2345,
      "name": "Growth Mindset (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Growth Mindset (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2397,
      "name": "Grp",
      "parent_id": 2345,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Grp",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2399,
      "name": "LOg1",
      "parent_id": 2343,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "LOg1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2343,
      "name": "Logical (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You learn efficiently when you are able to process new information in a systematic, methodical manner. There may also be situations when you enjoy learning organically, jumping around from one aspect to another.",
      "icon": "/uploads/factor/icon/2343/2015_AGILE_icons-LOGICAL.png",
      "alias": "Logical (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2350,
      "name": "NO FACTOR REQUIRED (2)",
      "parent_id": null,
      "question_ids": [17381],
      "description": "",
      "icon": null,
      "alias": "NO FACTOR REQUIRED (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2335,
      "name": "Receptive (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You may enjoy learning by seeking feedback from others around you. At the same time, in situations where recognition or ongoing support is not available, you will tend to find other ways and means to enhance your learning experience.",
      "icon": "/uploads/factor/icon/2335/2015_AGILE_icons-RECEPTIVE.png",
      "alias": "Receptive (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2337,
      "name": "Resourceful (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You are indifferent towards learning by finding innovative solutions or having a fixed set of pre-defined resources to learn from. You are able to adapt your learning approach depending upon the situation.",
      "icon": "/uploads/factor/icon/2337/2015_AGILE_icons-RESOURCEFUL.png",
      "alias": "Resourceful (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2336,
      "name": "Social (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You tend to seek interactions with your peers and colleagues to flourish in your learning experiences. In certain situations, you may also prefer to work independently and have the freedom to organise your own work in order to learn most effectively.",
      "icon": "/uploads/factor/icon/2336/2015_AGILE_icons-SOCIAL.png",
      "alias": "Social (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2398,
      "name": "Stra",
      "parent_id": 2344,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Stra",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2344,
      "name": "Strategic Orientation (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "Strategic Orientation (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2338,
      "name": "Structured (2)",
      "parent_id": null,
      "question_ids": [],
      "description": "You enjoy learning in an organised and supportive environment, with clear objectives and readily available resources. You may also find yourself in situations where you will tend to learn better when you are not constantly being directed in what, when, where and how to learn.",
      "icon": "/uploads/factor/icon/2338/2015_AGILE_icons-STRUCTURED.png",
      "alias": "Structured (2)",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2396,
      "name": "agile1",
      "parent_id": 2346,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "agile1",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2393,
      "name": "sub2",
      "parent_id": 2348,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "sub2",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2394,
      "name": "sub3",
      "parent_id": 2347,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "sub3",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2395,
      "name": "sub34",
      "parent_id": 2347,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "sub34",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }, {
      "id": 2392,
      "name": "subfactor",
      "parent_id": 2348,
      "question_ids": [],
      "description": "",
      "icon": null,
      "alias": "subfactor",
      "scoring_strategy": "questions",
      "factors_sub_factors": []
    }]
  },
  "occupations": {
    "60": [{
      "id": 110,
      "name": "Occupation2",
      "description": "desc for oc2",
      factors: [{id: 2380, predicate: "equal_to", value: 1, position: 3, weight: 1}, {
        id: 2379,
        predicate: "not_equal_to",
        value: 1,
        position: 3,
        weight: 1
      }]
    }, {
      "id": 109,
      "name": "Occupation1",
      "description": "desc for oc1",
      factors: [{id: 2380, predicate: "not_equal_to", value: 1, position: 3, weight: 1}, {
        id: 2379,
        predicate: "not_equal_to",
        value: 1,
        position: 3,
        weight: 1
      }]
    }]
  },
  "innovation_styles": {
    "60": [{
      "id": 110,
      "name": "st1",
      "position": 2,
      "description": "desc for st1",
      factors: [{id: 2380, predicate: "equal_to", value: 1, position: 3, weight: 1}, {
        id: 2379,
        predicate: "not_equal_to",
        value: 1,
        position: 3,
        weight: 1
      }]
    }, {
      "id": 109,
      "name": "st2",
      "position": 2,
      "description": "desc for st2",
      factors: [{id: 2380, predicate: "not_equal_to", value: 1, position: 3, weight: 1}, {
        id: 2379,
        predicate: "not_equal_to",
        value: 1,
        position: 3,
        weight: 1
      }]
    }]
  },
  "props": {"sizes": {"width": 850, "height": 1100, "fontSize": 14}},
  "dimension_ids": [60],
  "completed_assessments": [190],
  "data_configuration": "--- {}\n",
  "data_sheet_columns": [{"name": "No.", "type": "Number"}, {"name": "Email", "type": "Text"}, {
    "name": "Position",
    "type": "Number"
  }, {"name": "Full Name", "type": "Text"}, {
    "name": "Employee Number",
    "type": "Number"
  }, {"name": "Competency 1 Score", "type": "Number"}, {
    "name": "Brief Background / Context for Candidate",
    "type": "Markdown"
  }, {"name": "Overall Summary of Assessment Evaluation", "type": "HTML"}],
  "relationships": [{"id": 5, "type": "global", "name": "Manager", "assign_type": "manual"}, {
    "id": 6,
    "type": "global",
    "name": "Peer",
    "assign_type": "manual"
  }, {"id": 7, "type": "global", "name": "Self", "assign_type": "automatic"}, {
    "id": 8,
    "type": "global",
    "name": "Direct Report",
    "assign_type": "manual"
  }, {"id": 28, "type": "global", "name": "Self", "assign_type": "automatic"}],
  "category": "threesixty",
  "pages": [{
    "id": 1075,
    "name": "Page 1",
    "position": 1,
    "props": {},
    "display_logic": null,
    "modules": [{
      "id": 23073,
      "name": null,
      "position": 2,
      "props": {
        "colors": [{"id": 1, "color": "#4572A7"}, {"id": 2, "color": "#AA4643"}, {
          "id": 3,
          "color": "#89A54E"
        }, {"id": 4, "color": "#71588F"}, {"id": 5, "color": "#4198AF"}, {"id": 6, "color": "#DB843D"}, {
          "id": 7,
          "color": "#93A9CF"
        }, {"id": 8, "color": "#D19392"}, {"id": 9, "color": "#B9CD96"}, {"id": 10, "color": "#A99BBD"}],
        "choicesTexts": {},
        "position": {"left": 71.96651014939198, "top": 72.97592054391347, "width": 650, "height": 250},
        "style": {"fontColor": "#000", "fontSize": "100%", "fontFamily": "Arial"},
        "source": {
          "type": "Factor",
          "factors": [{"id": 2343, "alias": "Logical (2)", "name": "Logical (2)"}, {
            "id": 2341,
            "alias": "Contemplative (2)",
            "name": "Contemplative (2)"
          }]
        },
        "type": "Bar",
        "zIndex": 3001,
        "showValues": true,
        "showOnAllPages": false,
        "presetName": "VerticalBar",
        "filter": [63, 61, 62],
        "dataFormat": "Mean",
        "graphicalPosition": "Vertical",
        "graphicalRepresentation": "Standard",
        "showLegend": true,
        "textConditions": []
      },
      "type": "Graph",
      "assessment_id": 190
    }, {
      "id": 23070, "name": null, "position": 1, "props": {
        "colors": [{"id": 1, "color": "#4572A7"}, {"id": 2, "color": "#AA4643"}, {
          "id": 3,
          "color": "#89A54E"
        }, {"id": 4, "color": "#71588F"}, {"id": 5, "color": "#4198AF"}, {"id": 6, "color": "#DB843D"}, {
          "id": 7,
          "color": "#93A9CF"
        }, {"id": 8, "color": "#D19392"}, {"id": 9, "color": "#B9CD96"}, {"id": 10, "color": "#A99BBD"}],
        "choicesTexts": {},
        "position": {"left": 102.10170071658962, "top": 499, "width": 667, "height": 601},
        "style": {"fontColor": "#000", "fontSize": "100%", "fontFamily": "Arial"},
        "source": {
          "type": "Factor",
          "factors": [{"id": 2342, "alias": "Conceptual (2)", "name": "Conceptual (2)", "parent_id": null}, {
            "id": 2341,
            "alias": "Contemplative (2)",
            "name": "Contemplative (2)",
            "parent_id": null
          }, {"id": 2348, "alias": "Creative (2)", "name": "Creative (2)", "parent_id": null}, {
            "id": 2346,
            "alias": "Critical Thinking (2)",
            "name": "Critical Thinking (2)",
            "parent_id": null
          }, {"id": 2347, "alias": "Curious (2)", "name": "Curious (2)", "parent_id": null}, {
            "id": 2336,
            "alias": "Social (2)",
            "name": "Social (2)",
            "parent_id": null
          }, {"id": 2343, "alias": "Logical (2)", "name": "Logical (2)"}]
        },
        "type": "Circumplex",
        "zIndex": 3001,
        "showValues": true,
        "showOnAllPages": false,
        "presetName": "Circumplex",
        "filter": 63,
        "dataFormat": "Count",
        "chartBorderWidth": "17px",
        "numberOfDecimals": 0,
        "factorsColor": "#a8aaad",
        "subFactorsColor": "#eee",
        "factorsWidth": 36,
        "textConditions": [],
        "innerCircleRadius": 56,
        "innerCircleText": "HAHAHA"
      }, "type": "Graph", "assessment_id": 190
    }]
  }, {
    "id": 1076, "name": "Page 2", "position": 2, "props": {}, "display_logic": null, "modules": [{
      "id": 23071, "name": null, "position": 1, "props": {
        "colors": [{"id": 1, "color": "#4572A7"}, {"id": 2, "color": "#AA4643"}, {
          "id": 3,
          "color": "#89A54E"
        }, {"id": 4, "color": "#71588F"}, {"id": 5, "color": "#4198AF"}, {"id": 6, "color": "#DB843D"}, {
          "id": 7,
          "color": "#93A9CF"
        }, {"id": 8, "color": "#D19392"}, {"id": 9, "color": "#B9CD96"}, {"id": 10, "color": "#A99BBD"}],
        "choicesTexts": {},
        "position": {"left": 108.10170071658962, "top": 394, "width": 643, "height": 706},
        "style": {"fontColor": "#000", "fontSize": "100%", "fontFamily": "Arial"},
        "source": {
          "type": "Factor",
          "factors": [{"id": 2383, "alias": "2351_sub_2", "name": "2351_sub_2"}, {
            "id": 2382,
            "alias": "2351_sub_1",
            "name": "2351_sub_1"
          }, {"id": 2400, "alias": "Comp1", "name": "Comp1"}, {
            "id": 2342,
            "alias": "Conceptual (2)",
            "name": "Conceptual (2)"
          }, {"id": 2348, "alias": "Creative (2)", "name": "Creative (2)"}, {
            "id": 2351,
            "alias": "Derailer (2)",
            "name": "Derailer (2)"
          }]
        },
        "type": "Circumplex",
        "zIndex": 3001,
        "showValues": true,
        "showOnAllPages": false,
        "presetName": "Circumplex",
        "filter": null,
        "dataFormat": "Count",
        "numberOfDecimals": 0,
        "factorsColor": "#a8aaad",
        "subFactorsColor": "#eee",
        "factorsWidth": 25,
        "innerCircleRadius": 52,
        "innerCircleText": "The Light House",
        "textConditions": []
      }, "type": "Graph", "assessment_id": 190
    }]
  }],
  "result_completed_at": null,
  "norm_used": {},
  "result_locale": {},
  "default_language": {"code": "en", "name": "English", "direction": "ltr"},
  "locales": {},
  "assessments": [{
    "id": 190,
    "name": "A.G.I.L.E 360 (2)",
    "category": "threesixty",
    "disabled": false,
    "created_at": "2019-08-28T23:15:38.110+04:00",
    "flow": {
      "elements": [{"type": "Block", "elements": [], "path": [0], "props": {"current": "2572"}}, {
        "type": "Block",
        "elements": [],
        "path": [1],
        "props": {"current": "2573"}
      }, {"type": "Block", "elements": [], "path": [2], "props": {"current": "2575"}}, {
        "type": "Block",
        "elements": [],
        "path": [3],
        "props": {"current": "2577"}
      }, {"type": "Block", "elements": [], "path": [4], "props": {"current": "2579"}}, {
        "type": "Block",
        "elements": [],
        "path": [5],
        "props": {"current": "2580"}
      }, {"type": "Block", "elements": [], "path": [6], "props": {"current": "2581"}}, {
        "type": "Block",
        "elements": [],
        "path": [7],
        "props": {"current": "2582"}
      }, {"type": "Block", "elements": [], "path": [8], "props": {"current": "2583"}}, {
        "type": "Block",
        "elements": [],
        "path": [9],
        "props": {"current": "2584"}
      }, {"type": "Block", "elements": [], "path": [10], "props": {"current": "2585"}}, {
        "type": "Block",
        "elements": [],
        "path": [11],
        "props": {"current": "2586"}
      }, {"type": "Block", "elements": [], "path": [12], "props": {"current": "2587"}}, {
        "type": "Block",
        "elements": [],
        "path": [13],
        "props": {"current": "2588"}
      }, {"type": "Block", "elements": [], "path": [14], "props": {"current": "2589"}}, {
        "type": "Block",
        "elements": [],
        "path": [15],
        "props": {"current": "2590"}
      }, {"type": "Block", "elements": [], "path": [16], "props": {"current": "2591"}}, {
        "type": "Block",
        "elements": [],
        "path": [17],
        "props": {"current": "2592"}
      }, {"type": "Block", "elements": [], "path": [18], "props": {"current": "2593"}}, {
        "type": "Block",
        "elements": [],
        "path": [19],
        "props": {"current": "2594"}
      }, {"type": "Block", "elements": [], "path": [20], "props": {"current": "2595"}}, {
        "type": "Block",
        "elements": [],
        "path": [21],
        "props": {"current": "2596"}
      }, {"type": "Block", "elements": [], "path": [22], "props": {"current": "2597"}}, {
        "type": "Block",
        "elements": [],
        "path": [23],
        "props": {"current": "2598"}
      }, {"type": "Block", "elements": [], "path": [24], "props": {"current": "2599"}}, {
        "type": "Block",
        "elements": [],
        "path": [25],
        "props": {"current": "2600"}
      }]
    },
    "norm_rules": [],
    "dimension_id": 60,
    "factors": [],
    "factor_scoring_counters": {"2350": 1, "2351": 2},
    "blocks": [{
      "id": 2572,
      "name": "Default Block",
      "position": 1,
      "deleted": false,
      "props": {"randomization": {"type": "No"}, "buttons": {"prev_button": "Previous", "next_button": "Next"}},
      "created_at": "28 Aug 2019 / 23:15",
      "template_id": null,
      "questions": [{
        "id": 17377,
        "assessment_id": 190,
        "name": "MT",
        "type": "TextEntry",
        "position": 1,
        "props": {
          "choices": 3,
          "choicesTexts": ["Click to write Choice 1", "Click to write Choice 2", "Click to write Choice 3sdf sdf sdfsdf sdf sdfs fd"],
          "questionText": "<p><span style=\"font-size: 16px;\"><b>11111111</b></span></p>",
          "type": "DateEntry",
          "defaultValues": [],
          "randomization": {"type": "No"}
        },
        "deleted": false,
        "created_at": "2019-08-28T23:15:38.132+04:00",
        "validation": {"type": "None", "args": {}},
        "required_validation": {"enabled": false, "type": "Force"},
        "display_logic": null,
        "skip_logic": [],
        "template_id": null,
        "comments": []
      }, {
        "id": 17480,
        "assessment_id": 190,
        "name": "Q91",
        "type": "TextEntry",
        "position": 2,
        "props": {
          "choices": 3,
          "choicesTexts": ["Click to write Choice 1", "Click to write Choice 2", "Click to write Choice 3"],
          "questionText": "dsdffs",
          "type": "DateTimeEntry",
          "defaultValues": [],
          "randomization": {"type": "No"}
        },
        "deleted": false,
        "created_at": "2020-01-19T09:17:16.752+04:00",
        "validation": {"type": "None", "args": {}},
        "required_validation": {"enabled": false, "type": "Force"},
        "display_logic": null,
        "skip_logic": [],
        "template_id": null,
        "comments": []
      }]
    }, {
      "id": 2573,
      "name": "Name, Email, Age & Gender",
      "position": 2,
      "deleted": false,
      "props": {"randomization": {"type": "No"}, "buttons": {"prev_button": "Previous", "next_button": "Next"}},
      "created_at": "28 Aug 2019 / 23:15",
      "template_id": null,
      "questions": [{
        "id": 17378,
        "assessment_id": 190,
        "name": "SBS",
        "type": "SideBySide",
        "position": 1,
        "props": {
          "choices": 5,
          "scalePoints": 3,
          "choicesTexts": ["1 cho", "2 cho", "3 cho", "4 cho", "Click to write Statement 5"],
          "columnsData": [{
            "type": "Likert",
            "likertType": "SingleAnswer",
            "textType": "Medium",
            "text": "",
            "answers": 2,
            "answersTexts": ["", ""]
          }, {
            "type": "Likert",
            "likertType": "MultipleAnswer",
            "textType": "Medium",
            "text": "",
            "answers": 3,
            "answersTexts": ["", "", "Answer 3"]
          }, {
            "type": "Likert",
            "likertType": "SingleAnswer",
            "textType": "Medium",
            "text": "",
            "answers": 4,
            "answersTexts": ["", "", "Answer 3", "Answer 4"]
          }],
          "questionText": "<p><span style=\"font-size:14px\"><span style=\"font-family:Arial,Helvetica,sans-serif\">side by side</span></span></p>",
          "repeatHeaders": "None",
          "f": [{"scale": 0, "choice": 1, "value": "11111"}],
          "defaultValues": [],
          "randomization": {"type": "No"}
        },
        "deleted": false,
        "created_at": "2019-08-28T23:15:38.178+04:00",
        "validation": {"type": "None", "args": {}},
        "required_validation": {"enabled": false, "type": "Force"},
        "display_logic": null,
        "skip_logic": [],
        "template_id": null,
        "comments": []
      }, {
        "id": 17379,
        "assessment_id": 190,
        "name": "MC",
        "type": "MultipleChoice",
        "position": 2,
        "props": {
          "choices": 3,
          "choicesTexts": ["Click to write Choice 1", "Click to write Choice 2", "Click to write Choice 3"],
          "questionText": "<p><span style=\"font-size:14px\"><span style=\"font-family:Arial,Helvetica,sans-serif\">multiple choice</span></span></p>",
          "type": "SingleAnswer",
          "position": "Vertical",
          "defaultValues": [],
          "notApplicable": false,
          "notApplicableLabel": "Not Applicable",
          "randomization": {"type": "No"}
        },
        "deleted": false,
        "created_at": "2019-08-28T23:15:38.247+04:00",
        "validation": {"type": "None", "args": {}},
        "required_validation": {"enabled": false, "type": "Force"},
        "display_logic": null,
        "skip_logic": [],
        "template_id": null,
        "comments": []
      }, {
        "id": 17381,
        "assessment_id": 190,
        "name": "Sl",
        "type": "Slider",
        "position": 3,
        "props": {
          "choices": 3,
          "choicesTexts": ["Male", "Female"],
          "labels": 3,
          "labelsTexts": [],
          "questionText": "<p><span style=\"font-size:14px\"><span style=\"font-family:Arial,Helvetica,sans-serif\">Slider</span></span></p>",
          "type": "Slider",
          "gridLines": 10,
          "minValue": 0,
          "maxValue": 100,
          "numberOfDecimals": 0,
          "stars": 5,
          "interaction": "Discrete",
          "fakeResults": [20, 10, 30],
          "fakeResultsStars": [4, 1, 2],
          "defaultValues": [],
          "randomization": {"type": "No"}
        },
        "deleted": false,
        "created_at": "2019-08-28T23:15:38.356+04:00",
        "validation": {"type": "None", "args": {}},
        "required_validation": {"enabled": false, "type": "Force"},
        "display_logic": null,
        "skip_logic": [],
        "template_id": null,
        "comments": []
      }]
    }]
  }]
}
