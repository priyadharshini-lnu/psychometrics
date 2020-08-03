# frozen_string_literal: true

require 'rails_helper'

describe Assigns::CalculateAgileScoring do
  def setup_data(complete = false)
    @norm = FactoryBot.create(:norm, :percentile)
    @factor_id = @norm.factors.first.id

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
                        'factorId': @factor_id,
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

    @assign = FactoryBot.create(:assign, results: results)
    @agile = FactoryBot.create(:agile, assessment: @assign.assessment, config: config)

    if complete
      norm_data = { id: @norm.id, type: 'percentile' }
      @assign.update_columns(status: :completed, completed_at: Time.now, norm_data: norm_data)
    end
  end

  describe 'it broadcasts :invalid when assign is incomplete' do
    before(:all) do
      setup_data
    end

    subject { described_class.call(@assign) }

    it 'broadcasts :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:calculate)
      subject
    end
  end

  describe 'it broadcasts :ok when assign is complete' do
    before(:context) do
      setup_data(true)
    end

    subject { described_class.call(@assign) }

    it { expect { subject }.to broadcast(:ok) }

    it 'calculates and saves agile score' do
      expect(@assign.scoring).to be
    end

    it 'add scoring for all factors' do
      scoring = @assign.scoring
      factors = @norm.factors.pluck(:id)
      factors.each { |id| expect(scoring).to include(id.to_s) }
    end

    it 'counts correct answers properly' do
      scoring = @assign.scoring
      block = scoring[@factor_id.to_s]['blocks'].first
      count = block.values.first['count']

      expect(count).to eq(2)
    end

    it 'adds factor score' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('score')
    end

    it 'adds zscore' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('zscore')
    end

    it 'adds normed score' do
      factor_score = @assign.scoring.first.last
      expect(factor_score).to include('norm_score')
    end
  end
end
