# frozen_string_literal: true

require 'rails_helper'
require 'csv'

describe AdminJobs::MhsResultExport do
  let(:user) { create(:user, first_name: 'test', last_name: 'test', email: 'user+6.78@example.com') }
  let(:user_result) do
    create(:users_result, subject: user, evaluator: user, without_user_assessment: true)
  end
  let!(:relationship) { create(:relationship, type: :global, name: 'Self') }
  let!(:user_assessment) do
    create(:user_assessment,
           users_result: user_result,
           relationship: relationship,
           started_at: Time.zone.parse('2025-06-02 05:30:00'),
           completed_at: Time.zone.parse('2025-06-02 05:36:59'))
  end

  let(:campaign) { user_assessment.campaign }
  let(:assessment) { user_assessment.assessment }
  let(:job_record) do
    create(
      :admin_job_record,
      operation: :external_assessment_export,
      data: { campaign_id: campaign.id, assessment_id: assessment.id }
    )
  end

  subject { described_class.new(job_record) }

  context 'Mhs export' do
    before do
      allow_any_instance_of(UsersResult).to receive(:encoded_id).and_return('ABC123')
    end

    it 'returns csv with correct headers' do
      subject.call

      csv = CSV.read(active_storage_file_path(job_record.file), headers: true)
      actual_headers = csv.headers.map { |header| header&.delete("\uFEFF") } # Remove BOM if present

      expected_headers = [
        'Result ID',
        'Subject Name',
        'Subject Email',
        'Evaluator Name',
        'Evaluator Email',
        'Relationship',
        'Started At',
        'Completed At',
        'Status'
      ]

      expect(actual_headers).to eq(expected_headers)
    end

    it 'returns csv with correct data' do
      subject.call

      csv = CSV.read(active_storage_file_path(job_record.file), headers: true)
      actual_data = csv[0].fields

      expected_data = [
        'ABC123',
        "#{user_result.subject.first_name}, #{user_result.subject.last_name}",
        user_result.subject.email,
        "#{user_result.evaluator.first_name}, #{user_result.evaluator.last_name}",
        user_result.evaluator.email,
        relationship.name,
        user_assessment.started_at.try(:strftime, '%D %r'),
        user_assessment.completed_at.try(:strftime, '%D %r'),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}")
      ]

      expect(actual_data).to eq(expected_data)
    end

    context 'with multiple results' do
      let!(:another_result) do
        create(:users_result,
               user_assessment: create(:user_assessment,
                                       campaign: campaign,
                                       assessment: assessment))
      end

      it 'exports all results' do
        subject.call

        csv = CSV.read(active_storage_file_path(job_record.file), headers: true)

        expect(csv.count).to eq(2) # 2 data rows
      end
    end
  end
end
