# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportCampaignAIArtifactsJob do
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant) }
  let!(:artifact1) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           code: 'artifact_1',
           name: 'Test Artifact 1',
           instructions: 'Test instructions')
  end
  let!(:artifact2) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           code: 'artifact_2',
           name: 'Test Artifact 2')
  end
  let(:admin_job_record) { create(:admin_job_record, data: { 'campaign_id' => campaign.id }) }
  let(:job) { described_class.new(admin_job_record) }

  describe '#headers' do
    it 'returns the correct headers' do
      expect(job.headers).to eq(%w[
        ID
        Code
        Name
        AIAssistantID
        AIAssistantName
        Instructions
        IncludeAllDatasheetColumns
        DependencyQuestionIDs
        DependencyCampaignFactorCodes
        DependencySheetColumnNames
      ])
    end
  end

  describe '#records_for_export' do
    it 'returns artifacts for the campaign' do
      records = job.records_for_export
      expect(records.count).to eq(2)
      expect(records).to include(artifact1, artifact2)
    end
  end

  describe '#data_row' do
    it 'returns the correct data for an artifact' do
      row = job.data_row(artifact1).first
      expect(row[0]).to eq(artifact1.id)
      expect(row[1]).to eq('artifact_1')
      expect(row[2]).to eq('Test Artifact 1')
      expect(row[3]).to eq(ai_assistant.id)
      expect(row[4]).to eq(ai_assistant.name)
      expect(row[5]).to eq('Test instructions')
    end

    context 'with dependencies' do
      let(:question) { create(:question) }
      let!(:question_dependency) do
        AI::CampaignArtifactDependency.create!(
          campaign_ai_artifact: artifact1,
          dependency: question
        )
      end

      it 'includes dependency IDs' do
        row = job.data_row(artifact1).first
        expect(row[7]).to include(question.id.to_s)
      end

      context 'with campaign factor dependencies' do
        let(:campaign_factor) { create(:campaign_factor, campaign: campaign, code: 'test_factor') }
        let!(:factor_dependency) do
          AI::CampaignArtifactDependency.create!(
            campaign_ai_artifact: artifact1,
            dependency: campaign_factor
          )
        end

        it 'includes campaign factor codes' do
          row = job.data_row(artifact1).first
          expect(row[8]).to include('test_factor')
        end
      end

      context 'with sheet column dependencies' do
        let(:sheet) { create(:sheet, campaign: campaign) }
        let(:sheet_column) { create(:sheet_column, sheet: sheet, name: 'test_column') }
        let!(:column_dependency) do
          AI::CampaignArtifactDependency.create!(
            campaign_ai_artifact: artifact1,
            dependency: sheet_column
          )
        end

        it 'includes sheet column names' do
          row = job.data_row(artifact1).first
          expect(row[9]).to include('test_column')
        end
      end
    end
  end

  describe '#file_name' do
    it 'includes campaign name' do
      expect(job.file_name).to eq("#{campaign.name}-ai-artifacts.csv")
    end
  end
end
