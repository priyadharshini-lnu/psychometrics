# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skillvue::SaveScoresAndReport do
  let(:users_result) { create(:users_result) }
  let(:user_assessment) { create(:user_assessment, assessment: users_result.assessment) }
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

  let(:empty_user_reports_relation) do
    double('UserReportsRelation', pluck: [], first: nil)
  end

  before do
    allow(UsersResults::GenerateReports).to receive(:call)
    allow(user_assessment).to receive(:user_reports).with(:skillvue).and_return(empty_user_reports_relation)
  end

  describe '#call' do
    context 'when scores_and_report is blank' do
      let(:retry_count) { 2 }

      it 'retries with exponential backoff' do
        subject = described_class.new(user_assessment, nil, retry_count: retry_count)

        expect(Skillvue::SaveScoresAndReportJob).to receive(:set).with(wait: (2**retry_count).minute).and_return(
          double(perform_later: true)
        )

        subject.call
      end

      it 'enqueues the job with incremented retry count' do
        subject = described_class.new(user_assessment, nil, retry_count: retry_count)
        job_double = double('SaveScoresAndReportJob')

        allow(Skillvue::SaveScoresAndReportJob).to receive(:set).and_return(job_double)
        expect(job_double).to receive(:perform_later).with(user_assessment, retry_count: retry_count + 1)

        subject.call
      end

      it 'handles initial retry without retry_count' do
        subject = described_class.new(user_assessment, nil)

        expect(Skillvue::SaveScoresAndReportJob).to receive(:set).with(wait: 1.minute).and_return(
          double(perform_later: true)
        )

        subject.call
      end
    end

    it 'updates the user_assessment and users_result with external results' do
      subject.call

      user_assessment.reload
      expect(user_assessment.status).to eq('completed')
      expect(user_assessment.completed_at).to eq(DateTime.parse(scores_and_report['timestamp']).in_time_zone('UTC'))
      expect(user_assessment.users_result.external_results).to eq(scores_and_report['payload'])
    end

    it 'updates the user_report with PDF URL if present' do
      user_report = double('UserReport')
      user_reports_relation = double('UserReportsRelation')
      allow(user_reports_relation).to receive(:pluck).with(:id).and_return([1])
      allow(user_reports_relation).to receive(:first).and_return(user_report)
      allow(user_assessment).to receive(:user_reports).with(:skillvue).and_return(user_reports_relation)
      expect(user_report).to receive(:attach_pdf!).with(
        scores_and_report['pdfUrl'],
        'skillvue-report.pdf'
      )

      subject.call
    end

    it 'broadcasts :ok if report URL is blank' do
      report_data = scores_and_report.dup
      report_data['payload'] = report_data['payload'].dup
      report_data.delete('pdfUrl')

      subject = described_class.new(user_assessment, report_data)
      subject.call

      expect(user_assessment.users_result.reload.external_results).to eq(report_data['payload'])
    end
  end
end
