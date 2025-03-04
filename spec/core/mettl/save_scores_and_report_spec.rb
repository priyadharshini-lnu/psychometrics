# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::SaveScoresAndReport do
  let(:user_assessment) { create(:user_assessment) }
  let(:users_result) { create(:users_result, assessment: user_assessment.assessment) }
  let(:scores_and_report) do
    {
      'start_time_GMT' => 'Fri, 16 Aug 2024 13:14:13 UTC',
      'end_time_GMT' => 'Fri, 16 Aug 2024 13:14:21 UTC',
      'testStatus' => {
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
              'totalUnAnswered' => 0.0,
              'skillMarks' => [
                {
                  'skillName' => 'Agility',
                  'totalMarks' => 0.0,
                  'maxMarks' => 1.0,
                  'timeTaken' => 7.0,
                  'totalQuestion' => 1.0,
                  'totalCorrectAnswers' => 0.0,
                  'totalUnAnswered' => 0.0,
                  'difficultyMarks' => [
                    {
                      'level' => 'EASY',
                      'totalQuestion' => 1,
                      'totalMarks' => 0.0,
                      'totalUnAnswered' => 0,
                      'maxMarks' => 1.0,
                      'timeTaken' => 7,
                      'totalCorrectAnswers' => 0
                    }
                  ]
                }
              ],
              'difficultyMarks' => [
                {
                  'level' => 'EASY',
                  'totalQuestion' => 1,
                  'totalMarks' => 0.0,
                  'totalUnAnswered' => 0,
                  'maxMarks' => 1.0,
                  'timeTaken' => 7,
                  'totalCorrectAnswers' => 0
                }
              ],
              'questionWiseResponse' => nil
            }
          ],
          'performanceCategory' => 'Poor',
          'performanceCategoryVersion' => 1,
          'difficultyMarks' => [
            {
              'level' => 'EASY',
              'totalQuestion' => 1,
              'totalMarks' => 0.0,
              'totalUnAnswered' => 0,
              'maxMarks' => 1.0,
              'timeTaken' => 7,
              'totalCorrectAnswers' => 0
            }
          ],
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
  end

  subject { described_class.new(user_assessment, scores_and_report) }

  before do
    allow(user_assessment).to receive(:users_result).and_return(users_result)
    allow(UsersResults::GenerateReports).to receive(:call)
  end

  describe '#call' do
    it 'broadcasts :ok if scores_and_report is blank' do
      subject = described_class.new(user_assessment, {})

      expect(subject).to receive(:broadcast).with(:ok)

      subject.call
    end

    it 'updates the user_assessment and users_result with external results' do
      expect(users_result).to receive(:update).with(
        external_results: {
          meta_data: {
            start_time: DateTime.parse('Fri, 16 Aug 2024 13:14:13 UTC'),
            end_time: DateTime.parse('Fri, 16 Aug 2024 13:14:21 UTC'),
            overall_status: 'Completed',
            detailed_status: 'Test-taker Completed'
          },
          scores: scores_and_report['testStatus']['result']
        }
      )

      expect(user_assessment).to receive(:update).with(
        status: :completed,
        completed_at: DateTime.parse('Fri, 16 Aug 2024 13:14:21 UTC').in_time_zone('UTC')
      )

      expect(UsersResults::GenerateReports).to receive(:call).with(users_result, user_assessment.user)

      subject.call
    end

    it 'updates the user_report with pdfReport URL if present' do
      user_report = create(:user_report, user: user_assessment.user)
      allow(user_assessment).to receive(:user_reports).with(:mettl).and_return([user_report])

      subject.call

      expect(user_report.status).to eq('prepared')
      expect(user_report.reload.pdf_file.url).to be_present
    end

    it 'broadcasts :ok if pdfReport URL is blank' do
      scores_and_report['testStatus']['pdfReport'] = nil

      expect(subject).to receive(:broadcast).with(:ok)

      subject.call
    end
  end
end
