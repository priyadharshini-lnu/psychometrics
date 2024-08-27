# frozen_string_literal: true

require 'rails_helper'
require 'csv'

describe AdminJobs::MettlResultExport do
  let(:external_results) do
    {
      'scores' => {
        'maxMarks' => 1,
        'percentile' => 90.9090909090909,
        'totalMarks' => 0,
        'attemptTime' => 7.752
      }
    }
  end
  let(:user) { create(:user, first_name: 'test', last_name: 'test', email: 'user+6.78@example.com') }
  let(:user_result) { create(:users_result, subject: user, evaluator: user, external_results: external_results) }
  let!(:relationship) { create(:relationship, type: :global, name: 'Self') }
  let!(:user_assessment) do
    create(:user_assessment, users_result: user_result, relationship: relationship)
  end
  let(:campaign) { user_assessment.campaign }
  let(:assessment) { user_assessment.assessment }
  let(:job_record) do
    create(
      :admin_job_record, operation: :external_assessment_export,
      data: { campaign_id: campaign.id, assessment_id: assessment.id }
    )
  end

  context 'Mettl export' do
    it 'first row in csv contains headers' do
      described_class.new(job_record).call

      csv = CSV.read(active_storage_file_path(job_record.file), headers: true)
      actual_first_row = csv.headers.map { |header| header&.delete("\uFEFF") } # Remove BOM if present

      expected_first_row = [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Status',
        'Max Marks', 'Percentile', 'Total Marks', 'Attempt Time'
      ]

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv contains actual data' do
      described_class.new(job_record).call

      csv = CSV.read(active_storage_file_path(job_record.file), headers: true)
      actual_second_row = csv[0]

      expected_second_row = [
        user_result.encoded_id,
        "#{user_result.subject.first_name}, #{user_result.subject.last_name}",
        user_result.subject.email,
        "#{user_result.evaluator.first_name}, #{user_result.evaluator.last_name}",
        user_result.evaluator.email,
        relationship.name,
        user_result.started_at.try(:strftime, '%Y-%m-%d %H:%M:%S %z'),
        user_result.completed_at.try(:strftime, '%Y-%m-%d %H:%M:%S %z'),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        external_results['scores']['maxMarks'].to_s,
        external_results['scores']['percentile'].to_s,
        external_results['scores']['totalMarks'].to_s,
        external_results['scores']['attemptTime'].to_s
      ]

      expect(actual_second_row.fields).to eq(expected_second_row)
    end
  end
end
