
import NormResolver from 'modules/survey/models/NormResolver.js'

test('normalize empty tree to empty list', () => {
  const results = {
    "4": {
      "dirty": false,
      "answers": [
        {
          "index": 0,
          "value": true
        },
        {
          "index": 2,
          "value": true
        }
      ],
      "duration": 28306,
      "question_id": 4,
      "not_applicable": false
    },
    "5": {
      "dirty": false,
      "answers": [
        {
          "index": 0,
          "value": true
        },
        {
          "index": 2,
          "value": true
        }
      ],
      "duration": 1406
    },
    "6": {
      "dirty": false,
      "duration": 1406
    },
    "7": {
      "dirty": false,
      "answers": [
        {
          "index": 0,
          "value": true
        }
      ],
      "duration": 1250,
      "question_id": 7,
      "not_applicable": false
    }
  }
  const rules = [
    {
      "norm_id": "1",
      "norm_type": null,
      "conditions": [
        {
          "conditions": [
            {
              "subject": 4,
              "answer": "0",
              "predicate": "Selected",
              "type": "bool",
              "conditionType": "Question",
              "prefix": "And"
            },
            {
              "subject": 4,
              "prefix": "Or",
              "answer": "1",
              "predicate": "NotSelected",
              "type": "bool",
              "conditionType": "Question"
            }
          ],
          "prefix": "And"
        }
      ]
    },
    {
      "norm_id": null,
      "norm_type": "YTI",
      "conditions": [
        {
          "conditions": [
            {
              "subject": 5,
              "answer": "0",
              "predicate": "Displayed",
              "type": "bool",
              "conditionType": "Question",
              "prefix": "And"
            }
          ],
          "prefix": "And"
        }
      ]
    }
  ]
  const qwraps = [
    {
      "id": 4,
      "name": "Q1",
      "choicesIds": [0, 1, 2],
      "position": 1,
      "type": "MultipleChoice",
      "props": {
        "choices": 3,
        "choicesTexts": [
          "Click to write Choice 1",
          "Click to write Choice 2",
          "Click to write Choice 3"
        ],
        "questionText": "Block 1/ 1",
        "type": "MultipleAnswer",
        "position": "Vertical",
        "defaultValues": [],
        "notApplicable": false,
        "notApplicableLabel": "Not Applicable",
        "randomization": {
          "type": "No"
        }
      },
      "validation": {
        "type": "None",
        "args": {}
      },
      "required_validation": {
        "enabled": false,
        "type": "Force"
      },
      "display_logic": null,
      "skip_logic": [],
      "template_id": null,
      "save_as_template": false
    },
    {
      "choicesIds": [0, 1, 2],
      "id": 5,
      "name": "Q1",
      "position": 1,
      "type": "MultipleChoice",
      "props": {
        "choices": 3,
        "choicesTexts": [
          "Click to write Choice 1",
          "Click to write Choice 2",
          "Click to write Choice 3"
        ],
        "questionText": "Block 2",
        "type": "SingleAnswer",
        "position": "Vertical",
        "defaultValues": [],
        "notApplicable": false,
        "notApplicableLabel": "Not Applicable",
        "randomization": {
          "type": "No"
        }
      },
      "validation": {
        "type": "None",
        "args": {}
      },
      "required_validation": {
        "enabled": false,
        "type": "Force"
      },
      "display_logic": null,
      "skip_logic": [],
      "template_id": null,
      "save_as_template": false
    },
    {
      "choicesIds": [0, 1, 2],
      "id": 6,
      "name": "Q2",
      "position": 2,
      "type": "MultipleChoice",
      "props": {
        "choices": 3,
        "choicesTexts": [
          "Click to write Choice 1",
          "Click to write Choice 2",
          "Click to write Choice 3"
        ],
        "questionText": "Block2/1",
        "type": "SingleAnswer",
        "position": "Vertical",
        "defaultValues": [],
        "notApplicable": false,
        "notApplicableLabel": "Not Applicable",
        "randomization": {
          "type": "No"
        }
      },
      "validation": {
        "type": "None",
        "args": {}
      },
      "required_validation": {
        "enabled": false,
        "type": "Force"
      },
      "display_logic": null,
      "skip_logic": [],
      "template_id": null,
      "save_as_template": false
    },
  ]
  const resolver = new NormResolver(rules, {}, qwraps, results)
  expect(resolver.resolve()).toStrictEqual({id: "1", type: "YTI"})
})
