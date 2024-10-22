# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::GetScores, type: :service do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }
  let(:service) { described_class.new(user_assessment) }
  let(:client) { instance_double(Faraday::Connection) }

  before do
    allow(service).to receive(:client).and_return(client)
    allow(service).to receive(:broadcast)
  end

  describe '#call' do
    let(:response_body) do
      [
        {
          userId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
          scores: [
            {
              score: {
                score: 0.4936789682539683,
                variance: 0.25
              },
              source: {
                children: [
                  {
                    score: {
                      score: 0.6,
                      variance: 2
                    },
                    source: 'Q1T1 - Data Gathering',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    score: {
                      score: 0.6666666666666667,
                      variance: 2
                    },
                    source: 'Q1T1 - Mapping',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    score: {
                      score: 0.2,
                      variance: 1
                    },
                    source: 'Q1T3',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    score: {
                      score: 0.8333333333333334,
                      variance: 2
                    },
                    source: 'Q2T1 - Table Rank',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    score: {
                      score: 0.6666666666666666,
                      variance: 2
                    },
                    source: 'Q2T1 - Side Rank',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    score: {
                      score: 0.3913825396825397,
                      variance: 1
                    },
                    source: 'Q6T2',
                    competencyId: 'apFocusesOnIdentifyingSolutions'
                  }
                ],
                modifier: 'Merged'
              },
              competencyId: 'apFocusesOnIdentifyingSolutions'
            }
          ]
        }
      ].to_json
    end

    let(:response) { instance_double(Faraday::Response, status: 200, body: response_body) }

    it 'broadcasts the correct result when the API call is successful' do
      allow(client).to receive(:get).and_return(response)

      expect(service).to receive(:broadcast).with(:ok, JSON.parse(response_body).first)

      service.call
    end

    it 'raises an error and captures the exception when the API call fails' do
      allow(client).to receive(:get).and_raise(Faraday::Error.new('Connection failed'))

      expect(Sentry).to receive(:capture_exception).with(instance_of(Faraday::Error))
      expect(service).to receive(:broadcast).with(:ok, {})

      service.call
    end

    it 'raises an error when the response status is not 200' do
      allow(response).to receive(:status).and_return(500)
      allow(client).to receive(:get).and_return(response)

      expect do
        service.call
      end.to raise_error(Simulation::Exceptions::GetScoresFailed)
    end
  end
end
