# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::SaveScoresAndReport, type: :service do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let(:service) { described_class.new(user_assessment, retry_count: retry_count) }
  let(:retry_count) { 0 }

  before do
    allow(Simulation::GetScores).to receive(:call!).and_return(scores)
    allow(Simulation::SaveScoresAndReportJob).to receive(:set).and_return(Simulation::SaveScoresAndReportJob)
    allow(Simulation::SaveScoresAndReportJob).to receive(:perform_later)
    allow(service).to receive(:broadcast)
  end

  describe '#call' do
    context 'when scores are present' do
      let(:scores) do
        {
          'createdAt' => '2023-10-01T12:00:00Z',
          'scores' => [
            {
              'score' => {
                'score' => 0.4936789682539683,
                'variance' => 0.25
              },
              'source' => {
                'children' => [
                  {
                    'score' => {
                      'score' => 0.6,
                      'variance' => 2
                    },
                    'source' => 'Q1T1 - Data Gathering',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    'score' => {
                      'score' => 0.6666666666666667,
                      'variance' => 2
                    },
                    'source' => 'Q1T1 - Mapping',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    'score' => {
                      'score' => 0.2,
                      'variance' => 1
                    },
                    'source' => 'Q1T3',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    'score' => {
                      'score' => 0.8333333333333334,
                      'variance' => 2
                    },
                    'source' => 'Q2T1 - Table Rank',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    'score' => {
                      'score' => 0.6666666666666666,
                      'variance' => 2
                    },
                    'source' => 'Q2T1 - Side Rank',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  },
                  {
                    'score' => {
                      'score' => 0.3913825396825397,
                      'variance' => 1
                    },
                    'source' => 'Q6T2',
                    'competencyId' => 'apFocusesOnIdentifyingSolutions'
                  }
                ],
                'modifier' => 'Merged'
              },
              'competencyId' => 'apFocusesOnIdentifyingSolutions'
            }
          ]
        }
      end

      it 'updates the users_result with external results' do
        service.call

        expect(user_assessment.users_result.reload.external_results).to eq(
          'meta_data' => {
            'createdAt' => '2023-10-01T12:00:00.000Z'
          },
          'scores' => scores['scores'].first
        )
      end

      it 'updates the user_assessment status to completed' do
        service.call

        expect(user_assessment.reload.status).to eq('completed')
        expect(user_assessment.completed_at).to eq('2023-10-01T12:00:00.000Z'.in_time_zone('UTC'))
      end

      it 'broadcasts :ok' do
        expect(service).to receive(:broadcast).with(:ok)

        service.call
      end

      it 'calls generate_internal_reports' do
        expect(service).to receive(:generate_internal_reports)

        service.call
      end
    end

    context 'when scores are blank' do
      let(:scores) { nil }

      it 'retries saving the scores' do
        service.call

        expect(Simulation::SaveScoresAndReportJob).to have_received(:set).with(wait: 1.minute)
        expect(Simulation::SaveScoresAndReportJob).to have_received(:perform_later).with(user_assessment,
                                                                                         retry_count: 1)
      end
    end
  end
end
