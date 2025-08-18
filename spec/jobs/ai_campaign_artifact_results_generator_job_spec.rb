# frozen_string_literal: true

require 'rails_helper'

describe AICampaignArtifactResultsGeneratorJob, type: :job do
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

  describe '#perform' do
    let(:options) do
      {
        current_user: create(:user),
        force_regenerate: false
      }
    end

    before do
      allow(AI::CampaignArtifacts::ResultGenerator).to receive(:call)
    end

    it 'calls the result generator with correct parameters' do
      described_class.perform_now(ai_artifact, user, nil, options)

      expect(AI::CampaignArtifacts::ResultGenerator).to have_received(:call).with(
        ai_artifact,
        user,
        options
      )
    end

    context 'with admin job record' do
      let(:admin_job_record) { create(:admin_job_record) }

      before do
        allow(admin_job_record).to receive(:increment_completed_tasks!)
      end

      it 'increments completed tasks on admin job record' do
        described_class.perform_now(ai_artifact, user, admin_job_record, options)

        expect(admin_job_record).to have_received(:increment_completed_tasks!)
      end

      it 'still calls the service class correctly' do
        described_class.perform_now(ai_artifact, user, admin_job_record, options)

        expect(AI::CampaignArtifacts::ResultGenerator).to have_received(:call).with(
          ai_artifact,
          user,
          options
        )
      end
    end

    context 'without admin job record' do
      it 'does not raise error when admin_job_record is nil' do
        expect do
          described_class.perform_now(ai_artifact, user, nil, options)
        end.not_to raise_error
      end
    end
  end
end
