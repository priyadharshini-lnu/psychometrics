# frozen_string_literal: true

require 'rails_helper'

describe Assigns::CalculateAgileScoring do
  before(:all) do
    @assign = FactoryBot.create(:assign)
    @agile = FactoryBot.create(:agile, assessment: @assign.assessment)
    @norm = FactoryBot.create(:norm, :percentile)

    config = {
      'normId': @norm.id,
      'groups': [
        {
          'id': 'ed-1-group',
          'scenes': [
            {
              'id': 'ed-1-ass',
              'type': 'AssessmentScene',
              'data': {
                'blocks': [
                  {
                    'id': 'ed-1-ass-block-1',
                    'scoring': [
                      {
                        'factorId': @norm.factors.first.id,
                        'itemScore': 1
                      }
                    ],
                    'questions': [
                      {
                        'id': 'edg-1',
                        'answers': [
                          [
                            '2'
                          ]
                        ]
                      },
                      {
                        'id': 'edg-2',
                        'answers': [
                          [
                            '2'
                          ]
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
    }

    results = [
      {
        'answers' => {
          'edg-1' => {
            'id' => 'edg-1',
            'answers' => ['2'],
            'group_id' => 'ed-1-group'
          },
          'edg-2' => {
            'id' => 'edg-2',
            'answers' => ['2'],
            'group_id' => 'ed-1-group'
          }
        },
        'group_id' => 'ed-1-group'
      }
    ]

    @agile.update(config: config)
    @assign.update(results: results, norm_data: { id: @norm.id })
    @assign.complete!
  end

  before(:context) { described_class.call!(@assign) }

  context '.call' do
    it 'calculates and saves agile score' do
      expect(@assign.scoring).to be
    end

    it 'add scoring for all factors' do
      scoring = @assign.scoring
      factors = @norm.factors.map(&:id)
      factors.each { |id| expect(scoring).to include(id.to_s) }
    end

    it 'adds factor score' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('factor_score')
    end

    it 'adds zscore' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('zscore')
    end

    it 'adds normed score' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('normed_score')
    end
  end
end
