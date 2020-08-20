# frozen_string_literal: true

require 'rails_helper'

describe Agiles::ScrubConfig do
  context '.call' do
    let(:config) do
      {
        'completedGroups': [],
        'groups': [
          {
            'id': 'intro-group',
            'scenes': [
              {
                'id': 'intro-1',
                'type': 'ContentScene',
                'data': {
                  'theme': 'white',
                  'items': [
                    {
                      'type': 'text',
                      'style': 'h2',
                      'align': 'center',
                      'text': 'instructions:intro-1.title'
                    }
                  ],
                  'buttons': [
                    {
                      'type': 'primary',
                      'label': 'instructions:intro-1.next',
                      'target': 'next'
                    }
                  ]
                }
              }
            ]
          },
          {
            'id': 'nf-1-group',
            'scenes': [
              {
                'id': 'nf-1-ass',
                'type': 'AssessmentScene',
                'data': {
                  'theme': 'blue',
                  'maxDuration': 240,
                  'blocks': [
                    {
                      'id': 'nf-1-ass-block-1',
                      'type': 'Comparator',
                      'randomise': true,
                      'questions': [
                        {
                          'id': 'cmp-1',
                          'text': 'questions:nf.which_is_greater',
                          'left': '7',
                          'right': '12',
                          'answers': ['hello-world']
                        },
                        {
                          'id': 'cmp-2',
                          'text': 'questions:nf.which_is_greater',
                          'left': '5',
                          'right': '7',
                          'answers': ['hello-world']
                        }
                      ],
                      'scoring': [
                        { 'first': 1 },
                        { 'second': 2 }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ],
        'locale': {},
        'assets': {}
      }.with_indifferent_access
    end

    context 'Success' do
      subject { described_class.call(config) }

      it 'broadcasts :ok' do
        expect { subject }.to broadcast(:ok)
        expect(subject[:ok]).to be_an_instance_of(Array)
      end

      it 'removes scoring and answers keys' do
        groups = subject[:ok]

        group = groups[1]
        scene = group['scenes'].find { |scene_with_type| scene_with_type['type'] == 'AssessmentScene' }
        block = scene.dig('data', 'blocks').first
        questions = block['questions']

        expect(block).not_to have_key('scoring')
        expect(questions.first).not_to have_key('answers')
      end
    end
  end
end
