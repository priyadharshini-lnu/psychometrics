# frozen_string_literal: true

require 'rails_helper'

describe Mettl::GetScores do
  let!(:project) { create(:project) }
  let(:config) { { 'public_key' => 'public_key_value', 'private_key' => 'private_key_value' } }
  let!(:mettl_integration) { create(:integration, :mettl_integration, project: project) }

  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.id })
  end

  let!(:mettl_schedule) { create(:mettl_schedule, project: project, assessment: assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mettl_user_assessment) do
    create(:mettl_user_assessment, user_assessment: user_assessment, mettl_schedule_id: mettl_schedule.id)
  end

  let(:scores_response) do
    {
      'status' => 'SUCCESS',
      'candidate' => {
        'email' => '35851@example.com',
        'registration' => {
          'Email Address' => '35851@example.com',
          'First Name' => '35851',
          'Last Name' => '35851'
        },
        'testStatus' => {
          'start_time_GMT' => 'Fri, 16 Aug 2024 13:14:13 UTC',
          'end_time_GMT' => 'Fri, 16 Aug 2024 13:14:21 UTC',
          'status' => 'Completed',
          'compensatoryTime' => 'false',
          'overallStatus' => 'Completed',
          'detailedStatus' => 'Test-taker Completed',
          'startTime' => 'Fri, 16 Aug 2024 18:44:13 IST',
          'endTime' => 'Fri, 16 Aug 2024 18:44:21 IST',
          'completionMode' => 'Completed',
          'result' => {
            'totalMarks' => 0.0,
            'maxMarks' => 1.0,
            'percentile' => 90.9090909090909,
            'attemptTime' => 7.752,
            'candidateCredibilityIndex' => 'Not Applicable',
            'codePlagiarism' => 'NA',
            'totalQuestion' => 1.0,
            'totalCorrectAnswers' => 0.0,
            'totalUnAnswered' => 0.0,
            'sectionMarks' => [
              {
                'sectionName' => 'Section #1',
                'totalMarks' => 0.0,
                'maxMarks' => 1.0,
                'timeTaken' => 0.0,
                'totalQuestion' => 1.0,
                'totalCorrectAnswers' => 0.0,
                'totalUnAnswered' => 0.0
              }
            ],
            'performanceCategory' => 'Poor',
            'performanceCategoryVersion' => 1,
            'analysis' => {
              'responseStyles' => [],
              'recommendation' => [
                {
                  'type' => 'Performance Category',
                  'value' => 'Poor'
                }
              ]
            }
          },
          'pdfReport' => 'spec/fixtures/files/reports/test.pdf',
          'htmlReport' => 'https://mettl.com/analytics/share-report?key=g2I6vCFGblKiCFatK2iNbg%3D%3D'
        }
      }
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: scores_response.to_json) }

  subject { described_class.new(user_assessment) }

  before do
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when config is not present' do
      before do
        mettl_integration.destroy
      end

      it 'broadcasts :ok with an empty array' do
        expect(subject).to receive(:broadcast).with(:ok, [])
        subject.call
      end
    end

    context 'when config is present' do
      context 'and the API call is successful' do
        before do
          allow(client).to receive(:get).and_return(response)
        end

        it 'broadcasts :ok with the assessments' do
          expect(subject).to receive(:broadcast).with(:ok, scores_response['candidate'])
          subject.call
        end
      end

      context 'and the API call raises an error' do
        before do
          allow(client).to receive(:get).and_raise(Faraday::Error.new('error'))
        end

        it 'captures the exception and broadcasts :ok with an empty array' do
          expect(Sentry).to receive(:capture_exception).with(instance_of(Faraday::Error),
                                                             extra: { project_id: project.id })
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end
    end
  end
end
