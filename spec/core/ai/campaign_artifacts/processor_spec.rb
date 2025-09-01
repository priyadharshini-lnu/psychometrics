# frozen_string_literal: true

require 'rails_helper'

describe AI::CampaignArtifacts::Processor do
  let!(:campaign) { create(:campaign) }
  let!(:ai_assistant) do
    assistant = create(:assistant)
    assistant.assistant_output_schema_keys.create!(key: 'summary')
    assistant.assistant_output_schema_keys.create!(key: 'feedback')
    assistant
  end
  let!(:ai_artifact) { create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  describe '#call' do
    context 'when scheduling jobs for campaign artifacts' do
      let(:current_user) { create(:user) }
      let(:admin_job_record) { create(:admin_job_record) }

      before do
        allow(AICampaignArtifactResultsGeneratorJob).to receive(:perform_later)
      end

      it 'schedules job with correct parameters and options' do
        processor = described_class.new(campaign, user, current_user, admin_job_record)

        processor.call

        expect(AICampaignArtifactResultsGeneratorJob).to have_received(:perform_later).with(
          ai_artifact,
          user,
          admin_job_record,
          {
            current_user: current_user,
            force_regenerate: false
          }
        )
      end

      it 'uses user as current_user when current_user is not provided' do
        processor = described_class.new(campaign, user, nil, admin_job_record)

        processor.call

        expect(AICampaignArtifactResultsGeneratorJob).to have_received(:perform_later).with(
          ai_artifact,
          user,
          admin_job_record,
          {
            current_user: user,
            force_regenerate: false
          }
        )
      end
    end

    context 'with multiple campaign artifacts' do
      let!(:second_ai_artifact) { create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant) }

      before do
        allow(AICampaignArtifactResultsGeneratorJob).to receive(:perform_later)
      end

      it 'schedules job for each campaign artifact' do
        processor = described_class.new(campaign, user)

        processor.call

        expect(AICampaignArtifactResultsGeneratorJob).to have_received(:perform_later).twice
      end
    end

    context 'when campaign has no ai artifacts' do
      let!(:empty_campaign) { create(:campaign) }

      before do
        allow(AICampaignArtifactResultsGeneratorJob).to receive(:perform_later)
      end

      it 'does not schedule any jobs' do
        processor = described_class.new(empty_campaign, user)

        processor.call

        expect(AICampaignArtifactResultsGeneratorJob).not_to have_received(:perform_later)
      end
    end
  end
end
