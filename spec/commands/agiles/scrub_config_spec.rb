# frozen_string_literal: true

require 'rails_helper'

describe Agiles::ScrubConfig do
  context '.call' do
    let(:config) do
      {
        completedGroups: [],
        groups: [
          {
            id: 'intro-group',
            scenes: [
              {
                id: 'intro-1',
                type: 'ContentScene',
                data: {
                  theme: 'white',
                  items: [
                    {
                      type: 'text',
                      style: 'h2',
                      align: 'center',
                      text: 'instructions:intro-1.title'
                    }
                  ],
                  buttons: [
                    {
                      type: 'primary',
                      label: 'instructions:intro-1.next',
                      target: 'next'
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'nf-1-group',
            scenes: [
              {
                id: 'nf-1-ass',
                type: 'AssessmentScene',
                data: {
                  theme: 'blue',
                  maxDuration: 240,
                  blocks: [
                    {
                      id: 'nf-1-ass-block-1',
                      type: 'Comparator',
                      randomise: true,
                      maxItems: 3,
                      questions: [
                        {
                          id: 'cmp-1',
                          randomSet: 1,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-2',
                          randomSet: 1,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-1-r',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-2-r',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-3',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-4',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        }
                      ],
                      scoring: [
                        { first: 1 },
                        { second: 2 }
                      ]
                    },
                    {
                      id: 'nf-1-ass-block-2',
                      type: 'Comparator',
                      randomise: true,
                      questions: [
                        {
                          id: 'cmp-5',
                          randomSet: 1,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-6',
                          randomSet: 1,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-7',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-8',
                          randomSet: 2,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        }
                      ],
                      scoring: [
                        { first: 1 },
                        { second: 2 }
                      ]
                    },
                    {
                      id: 'nf-1-ass-block-3',
                      type: 'Comparator',
                      randomise: true,
                      questions: [
                        {
                          id: 'cmp-9',
                          randomSet: 3,
                          text: 'questions:nf.which_is_greater',
                          left: '7',
                          right: '12',
                          answers: ['hello-world']
                        },
                        {
                          id: 'cmp-10',
                          randomSet: 3,
                          text: 'questions:nf.which_is_greater',
                          left: '5',
                          right: '7',
                          answers: ['hello-world']
                        }
                      ],
                      scoring: [
                        { first: 1 },
                        { second: 2 }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ],
        locale: {},
        assets: {}
      }.with_indifferent_access
    end

    context 'Success' do
      subject { described_class.call(config, 1) }

      it 'broadcasts :ok' do
        expect { subject }.to broadcast(:ok)
        expect(subject[:ok]).to be_an_instance_of(Array)
      end

      it 'removes scoring, answers, randomise and maxItems keys' do
        groups = subject[:ok]

        group = groups[1]
        scene = group['scenes'].find { |scene_with_type| scene_with_type['type'] == 'AssessmentScene' }
        block = scene.dig('data', 'blocks').first
        questions = block['questions']

        expect(block).not_to have_key('scoring')
        expect(block).not_to have_key('randomise')
        expect(block).not_to have_key('maxItems')
        expect(questions.first).not_to have_key('answers')
      end

      it 'returns random question set' do
        groups = subject[:ok]

        group = groups[1]
        scene = group['scenes'].find { |scene_with_type| scene_with_type['type'] == 'AssessmentScene' }
        block = scene.dig('data', 'blocks').first
        questions = block['questions']

        expect(questions.length).to be(3)
        expect(questions).to all(include(randomSet: 2))
      end

      it 'retains the random set for subsequent blocks if exists' do
        groups = subject[:ok]

        first_block_questions = groups.dig(1, 'scenes', 0, 'data', 'blocks', 0, 'questions')
        second_block_questions = groups.dig(1, 'scenes', 0, 'data', 'blocks', 1, 'questions')
        third_block_questions = groups.dig(1, 'scenes', 0, 'data', 'blocks', 2, 'questions')

        expect(first_block_questions).to all(include(randomSet: 2))
        expect(second_block_questions).to all(include(randomSet: 2))
        expect(third_block_questions).to all(include(randomSet: 3))
      end

      it 'randomises the questions' do
        groups = subject[:ok]

        first_block_questions = groups.dig(1, 'scenes', 0, 'data', 'blocks', 0, 'questions')

        expect(first_block_questions).to eq([
          {
            'id' => 'cmp-2-r',
            'randomSet' => 2,
            'text' => 'questions:nf.which_is_greater',
            'left' => '5',
            'right' => '7'
          },
          {
            'id' => 'cmp-3',
            'randomSet' => 2,
            'text' => 'questions:nf.which_is_greater',
            'left' => '7',
            'right' => '12'
          },
          {
            'id' => 'cmp-1-r',
            'randomSet' => 2,
            'text' => 'questions:nf.which_is_greater',
            'left' => '7',
            'right' => '12'
          }
        ])
      end
    end
  end
end
