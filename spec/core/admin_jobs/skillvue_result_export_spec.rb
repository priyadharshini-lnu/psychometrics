# frozen_string_literal: true

require 'rails_helper'
require 'csv'

describe AdminJobs::SkillvueResultExport do
  let(:external_results) do
    {
      'overallMatchPercentage' => 65,
      'candidate' => {
        'name' => '45282',
        'surname' => '45282',
        'email' => 'bcf2cd3be@example.com',
        'timestamp' => '2025-06-02T05:36:59.827Z',
        'position' => 'MTE Test',
        'language' => 'en'
      }
    }
  end
  let(:user) { create(:user, first_name: 'test', last_name: 'test', email: 'user+6.78@example.com') }
  let(:user_result) do
    create(:users_result, subject: user, evaluator: user, external_results: external_results,
   without_user_assessment: true)
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

  context 'Skillvue export' do
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
        'Status',
        'Overall Match Percentage'
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
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        external_results['overallMatchPercentage'].to_s
      ]

      expect(actual_data).to eq(expected_data)
    end

    context 'when external results are missing' do
      let(:external_results) { nil }

      it 'handles missing data gracefully' do
        subject.call

        csv = CSV.read(active_storage_file_path(job_record.file), headers: true)
        actual_data = csv[0].fields

        expect(actual_data[-1]).to be_nil # Overall Match Percentage should be nil
      end
    end

    context 'with multiple results' do
      let!(:another_result) do
        create(:users_result,
               user_assessment: create(:user_assessment,
                                       campaign: campaign,
                                       assessment: assessment),
               external_results: { 'overallMatchPercentage' => 75 })
      end

      it 'exports all results' do
        subject.call

        csv = CSV.read(active_storage_file_path(job_record.file), headers: true)

        expect(csv.count).to eq(2) # 2 data rows
        scores = csv.map { |row| row['Overall Match Percentage'] }
        expect(scores).to match_array(%w[65 75])
      end
    end
  end
end
