# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportCampaignAIArtifactsResultsJob do
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant) }

  let!(:artifact1) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           code: 'executive_summary',
           name: 'Executive Summary')
  end

  let!(:artifact2) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           code: 'leadership_profile',
           name: 'Leadership Profile')
  end

  let!(:schema_key1_artifact1) do
    create(:assistant_output_schema_key,
           ai_assistant: ai_assistant,
           key: 'summary',
           key_type: 'string')
  end

  let!(:schema_key2_artifact1) do
    create(:assistant_output_schema_key,
           ai_assistant: ai_assistant,
           key: 'feedback',
           key_type: 'string')
  end

  let!(:user1) { create(:user, email: 'user1@example.com', first_name: 'John', last_name: 'Doe') }
  let!(:user2) { create(:user, email: 'user2@example.com', first_name: 'Jane', last_name: 'Smith') }
  let!(:user3) { create(:user, email: 'user3@example.com', first_name: 'Bob', last_name: 'Wilson') }

  let!(:campaign_user1) { create(:campaign_user, campaign: campaign, user: user1) }
  let!(:campaign_user2) { create(:campaign_user, campaign: campaign, user: user2) }
  let!(:campaign_user3) { create(:campaign_user, campaign: campaign, user: user3) }

  let(:job_record) do
    create(:admin_job_record,
           operation: :export_campaign_ai_artifacts_results,
           data: { 'campaign_id' => campaign.id })
  end

  let(:job) { described_class.new(job_record) }

  describe '#headers' do
    it 'returns correct headers with all artifact keys' do
      expected_headers = [
        'User ID',
        'Email',
        'First Name',
        'Last Name',
        'executive_summary.summary',
        'executive_summary.feedback',
        'leadership_profile.summary',
        'leadership_profile.feedback',
        'Generated At'
      ]

      expect(job.send(:headers)).to eq(expected_headers)
    end
  end

  describe '#write_csv and export' do
    context 'when all users have results' do
      let!(:result1_artifact1) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact1,
               checkpoint: { 'summary' => 'User 1 Summary', 'feedback' => 'Great work' })
      end

      let!(:result1_artifact2) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact2,
               checkpoint: { 'summary' => 'User 1 Profile', 'feedback' => 'Strong leader' })
      end

      let!(:result2_artifact1) do
        create(:campaign_ai_artifact_result,
               user: user2,
               campaign_ai_artifact: artifact1,
               checkpoint: { 'summary' => 'User 2 Summary', 'feedback' => 'Good performance' })
      end

      let!(:result2_artifact2) do
        create(:campaign_ai_artifact_result,
               user: user2,
               campaign_ai_artifact: artifact2,
               checkpoint: { 'summary' => 'User 2 Profile', 'feedback' => 'Developing leader' })
      end

      it 'exports all users with their artifact results' do
        described_class.call!(job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
        headers = csv[0]
        data_rows = csv[1..]

        expect(headers).to include('User ID', 'Email', 'First Name', 'Last Name')
        expect(headers).to include('executive_summary.summary', 'executive_summary.feedback')
        expect(headers).to include('leadership_profile.summary', 'leadership_profile.feedback')

        expect(data_rows.size).to eq(3)

        user1_row = data_rows.find { |row| row[0] == user1.id.to_s }
        expect(user1_row[1]).to eq('user1@example.com')
        expect(user1_row[2]).to eq('John')
        expect(user1_row[3]).to eq('Doe')
        expect(user1_row[4]).to eq('User 1 Summary')
        expect(user1_row[5]).to eq('Great work')
        expect(user1_row[6]).to eq('User 1 Profile')
        expect(user1_row[7]).to eq('Strong leader')

        user2_row = data_rows.find { |row| row[0] == user2.id.to_s }
        expect(user2_row[4]).to eq('User 2 Summary')
        expect(user2_row[5]).to eq('Good performance')
      end
    end

    context 'when a user has no results' do
      let!(:result1_artifact1) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact1,
               checkpoint: { 'summary' => 'User 1 Summary', 'feedback' => 'Great work' })
      end

      let!(:result1_artifact2) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact2,
               checkpoint: { 'summary' => 'User 1 Profile', 'feedback' => 'Strong leader' })
      end

      it 'shows N/A for users without results' do
        described_class.call!(job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
        data_rows = csv[1..]

        user2_row = data_rows.find { |row| row[0] == user2.id.to_s }
        expect(user2_row[4]).to eq('N/A')
        expect(user2_row[5]).to eq('N/A')
        expect(user2_row[6]).to eq('N/A')
        expect(user2_row[7]).to eq('N/A')
        expect(user2_row[8]).to be_nil

        user3_row = data_rows.find { |row| row[0] == user3.id.to_s }
        expect(user3_row[4]).to eq('N/A')
        expect(user3_row[5]).to eq('N/A')
      end
    end

    context 'when result has missing keys in checkpoint' do
      let!(:result1_artifact1) do
        result = AI::CampaignArtifactResult.new(
          user: user1,
          assistable: artifact1,
          checkpoint: { 'summary' => 'User 1 Summary' }
        )
        result.save(validate: false)
        result
      end

      let!(:result1_artifact2) do
        result = AI::CampaignArtifactResult.new(
          user: user2,
          assistable: artifact2,
          checkpoint: {}
        )
        result.save(validate: false)
        result
      end

      it 'shows N/A for missing keys' do
        described_class.call!(job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
        user1_row = csv.find { |row| row[0] == user1.id.to_s }
        user2_row = csv.find { |row| row[0] == user2.id.to_s }

        expect(user1_row[4]).to eq('User 1 Summary')
        expect(user1_row[5]).to eq('N/A')
        expect(user1_row[6]).to eq('N/A')
        expect(user1_row[7]).to eq('N/A')

        expect(user2_row[4]).to eq('N/A')
        expect(user2_row[5]).to eq('N/A')
        expect(user2_row[6]).to eq('N/A')
        expect(user2_row[7]).to eq('N/A')
      end
    end

    context 'when result has error' do
      let!(:result1_artifact1) do
        result = AI::CampaignArtifactResult.new(
          user: user1,
          assistable: artifact1,
          checkpoint: nil,
          error: 'API Error'
        )
        result.save(validate: false)
        result
      end

      let!(:result1_artifact2) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact2,
               checkpoint: { 'summary' => 'User 1 Profile', 'feedback' => 'Strong leader' })
      end

      it 'treats error results as N/A for all keys' do
        described_class.call!(job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
        user1_row = csv.find { |row| row[0] == user1.id.to_s }

        expect(user1_row[4]).to eq('N/A')
        expect(user1_row[5]).to eq('N/A')
        expect(user1_row[6]).to eq('User 1 Profile')
        expect(user1_row[7]).to eq('Strong leader')
      end
    end

    context 'with multiple artifacts and schema keys' do
      let!(:schema_key3) do
        create(:assistant_output_schema_key,
               ai_assistant: ai_assistant,
               key: 'recommendation',
               key_type: 'string')
      end

      let!(:result1_artifact1) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact1,
               checkpoint: {
                 'summary' => 'Summary text',
                 'feedback' => 'Feedback text',
                 'recommendation' => 'Recommendation text'
               })
      end

      let!(:result1_artifact2) do
        create(:campaign_ai_artifact_result,
               user: user1,
               campaign_ai_artifact: artifact2,
               checkpoint: {
                 'summary' => 'Profile Summary',
                 'feedback' => 'Profile Feedback',
                 'recommendation' => 'Profile Recommendation'
               })
      end

      it 'includes all columns for all artifact keys' do
        described_class.call!(job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
        headers = csv[0]

        expect(headers).to include('executive_summary.summary')
        expect(headers).to include('executive_summary.feedback')
        expect(headers).to include('executive_summary.recommendation')
        expect(headers).to include('leadership_profile.summary')
        expect(headers).to include('leadership_profile.feedback')
        expect(headers).to include('leadership_profile.recommendation')
        expect(headers).to include('Generated At')

        data_row = csv[1]
        expect(data_row[4]).to eq('Summary text')
        expect(data_row[5]).to eq('Feedback text')
        expect(data_row[6]).to eq('Recommendation text')
      end
    end

    context 'when campaign has no artifacts' do
      let(:empty_campaign) { create(:campaign) }
      let(:empty_job_record) do
        create(:admin_job_record,
               operation: :export_campaign_ai_artifacts_results,
               data: { 'campaign_id' => empty_campaign.id })
      end

      it 'exports only static headers with no user data' do
        described_class.call!(empty_job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(empty_job_record.file))

        expect(csv[0]).to eq(['User ID', 'Email', 'First Name', 'Last Name', 'Generated At'])
        expect(csv.size).to eq(1)
      end
    end

    context 'when campaign is a 360 campaign' do
      let(:threesixty_base_campaign) { create(:campaign, :threesixty) }
      let(:threesixty_campaign) { create(:threesixty_campaign, campaign: threesixty_base_campaign) }
      let(:threesixty_artifact) do
        create(:campaign_ai_artifact, campaign: threesixty_base_campaign, ai_assistant: ai_assistant)
      end
      let(:threesixty_job_record) do
        create(:admin_job_record,
               operation: :export_campaign_ai_artifacts_results,
               data: { 'campaign_id' => threesixty_base_campaign.id })
      end
      let(:subject_user) { create(:user, email: 'subject@example.com', first_name: 'Subject', last_name: 'User') }
      let(:evaluator_user) { create(:user, email: 'evaluator@example.com', first_name: 'Evaluator', last_name: 'User') }

      before do
        threesixty_artifact
        create(:campaign_user, campaign: threesixty_base_campaign, user: subject_user)
        create(:campaign_user, campaign: threesixty_base_campaign, user: evaluator_user)
        create(:threesixty_subject, campaign: threesixty_base_campaign, user: subject_user)
      end

      it 'only exports subjects, not evaluators' do
        described_class.call!(threesixty_job_record)

        csv = CsvUtf8.to_array(active_storage_file_path(threesixty_job_record.file))
        exported_emails = csv[1..].pluck(1)

        expect(exported_emails).to include('subject@example.com')
        expect(exported_emails).not_to include('evaluator@example.com')
      end
    end
  end
end
