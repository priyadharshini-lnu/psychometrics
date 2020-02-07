const assessmentWithEmbededData = {
  id: 1,
  name: 'test-assessment',
  flow: {
    elements: [
      {
        type: 'Block',
        elements: [],
        path: [0],
        props: {current: '1'},
      },
      {
        type: 'Block',
        elements: [],
        path: [3,1],
        props: { current: '2' },
      },
    ],
  },
  norm_rules: [],
  enable_back: false,
  enable_progress: true,
  blocks: [
    {
      id: 1,
      name: 'Block1',
      position: 1,
      props: {
        randomization: {
          type: 'No',
        },
        buttons: {
          prev_button: 'Previous',
          next_button: 'Next',
        },
      },
      template_id: null,
      save_as_template: false,
      questions: [
        {
          id: 1,
          block_id: 1,
          name: 'Q1',
          position: 1,
          type: 'MultipleChoice',
          props: {
            choices: 2,
            choicesTexts: [
              'Yes',
              'No',
            ],
            questionText: 'Have you taken part in any extra-curricular activities in university?',
            type: 'SingleAnswer',
            position: 'Vertical',
            defaultValues: [

            ],
            notApplicable: false,
            notApplicableLabel: 'Not Applicable',
            randomization: {
              type: 'No',
            },
          },
          validation: {
            type: 'None',
            args: {

            },
          },
          required_validation: {
            enabled: false,
            type: 'Force',
          },
          display_logic: null,
          skip_logic: [

          ],
          template_id: null,
          save_as_template: false,
        },
        {
          id: 2,
          block_id: 1,
          name: 'Q3',
          position: 2,
          type: 'TextEntry',
          props: {
            choices: 3,
            choicesTexts: [
              'Click to write Choice 1',
              'Click to write Choice 2',
              'Click to write Choice 3',
            ],
            questionText: 'Please specify',
            type: 'DateEntry',
            defaultValues: [

            ],
            randomization: {
              type: 'No',
            },
          },
          validation: {
            type: 'None',
            args: {

            },
          },
          required_validation: {
            enabled: false,
            type: 'Force',
          },
          display_logic: {
            conditions: [
              {
                prefix: 'And',
                conditions: [
                  {
                    conditionType: 'Question',
                    type: 'bool',
                    subject: 1,
                    prefix: 'And',
                    answer: '0',
                    predicate: 'Selected',
                  },
                ],
              },
            ],
          },
          skip_logic: [

          ],
          template_id: null,
          save_as_template: false,
        },
      ],
    },
    {
      id: 2,
      name: 'Block2',
      position: 2,
      props: {
        randomization: {
          type: 'No',
        },
        buttons: {
          prev_button: 'Previous',
          next_button: 'Next',
        },
      },
      template_id: null,
      save_as_template: false,
      questions: [
        {
          id: 3,
          block_id: 2,
          name: 'Q2',
          position: 1,
          type: 'MultipleChoice',
          props: {
            choices: 3,
            choicesTexts: [
              'Click to write Choice 1',
              'Click to write Choice 2',
              'Click to write Choice 3',
            ],
            questionText: 'Click to write the question text',
            type: 'SingleAnswer',
            position: 'Vertical',
            defaultValues: [

            ],
            notApplicable: false,
            notApplicableLabel: 'Not Applicable',
            randomization: {
              type: 'No',
            },
          },
          validation: {
            type: 'None',
            args: {},
          },
          required_validation: {
            enabled: false,
            type: 'Force',
          },
          display_logic: null,
          skip_logic: [

          ],
          template_id: null,
          save_as_template: false,
        },
      ],
    },
  ],
}

export default assessmentWithEmbededData
