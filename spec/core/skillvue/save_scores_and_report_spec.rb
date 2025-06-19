# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skillvue::SaveScoresAndReport do
  let(:user_assessment) { create(:user_assessment) }
  let(:users_result) { create(:users_result, assessment: user_assessment.assessment) }
  let(:encoded_id) { UserAssessment.encode_id(user_assessment.id) }
  let(:scores_and_report) do
    {
      'type' => 'report.ready',
      'payload' => {
        'candidate' => {
          'name' => '45282',
          'surname' => '45282',
          'email' => 'bcf2cd3be@example.com',
          'timestamp' => '2025-06-02T05:36:59.827Z',
          'position' => 'Test Position',
          'language' => 'en'
        },
        'overallMatchPercentage' => 65,
        'skills' => [
          {
            'name' => 'Cognitive Flexibility',
            'rating' => 2,
            'methodology' => 'Video Interview',
            'questions' => 3,
            'duration' => 72,
            'definition' => 'Ability to adapt to context and different requirements to achieve expected outcomes.',
            'behavioralIndicators' => [
              {
                'name' => 'Seize opportunities',
                'description' => 'Accepts the challenge of new, uncertain and poorly defined situations.',
                'evaluation' => 'Not expressed'
              }
            ],
            'summary' => 'The candidate demonstrates limited cognitive flexibility.'
          }
        ]
      },
      'pdfUrl' => 'https://gpt-reports-storage.s3.eu-west-1.amazonaws.com/demo/4391a51016e15ee2cdab0fc07be4c473/report_light.pdf',
      'userId' => encoded_id,
      'timestamp' => '2025-06-02T05:36:59.827Z'
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
      expect(users_result).to receive(:update).with(external_results: scores_and_report['payload'])

      expect(user_assessment).to receive(:update).with(
        status: :completed,
        completed_at: DateTime.parse(scores_and_report['timestamp']).in_time_zone('UTC')
      )

      expect(UsersResults::GenerateReports).to receive(:call).with(users_result, user_assessment.user)

      subject.call
    end

    it 'updates the user_report with PDF URL if present' do
      user_report = double('UserReport')
      allow(user_assessment).to receive(:user_reports).with(:skillvue).and_return([user_report])
      expect(user_report).to receive(:attach_pdf!).with(
        scores_and_report['pdfUrl'],
        'skillvue-report.pdf'
      )

      subject.call
    end

    it 'broadcasts :ok if report URL is blank' do
      report_data = scores_and_report.dup
      report_data['payload'] = report_data['payload'].dup
      report_data['payload']['report'] = nil

      subject = described_class.new(user_assessment, report_data)

      # Still expect to update the results
      expect(users_result).to receive(:update).with(external_results: report_data['payload'])
      expect(subject).to receive(:broadcast).with(:ok)

      subject.call
    end
  end
end
