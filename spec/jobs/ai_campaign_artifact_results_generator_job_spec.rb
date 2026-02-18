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

    it 'calls the result generator with correct parameters' do
      stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok)

      described_class.perform_now(ai_artifact, user, nil, options)
    end

    context 'with admin job record' do
      let(:admin_job_record) { create(:admin_job_record) }

      before do
        allow(admin_job_record).to receive(:increment_completed_tasks!)
      end

      it 'increments completed tasks on admin job record on success' do
        stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok)

        described_class.perform_now(ai_artifact, user, admin_job_record, options)

        expect(admin_job_record).to have_received(:increment_completed_tasks!)
      end

      context 'when result generator broadcasts error' do
        let(:error_message) { 'Dependency not available' }

        before do
          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, error_message)
        end

        it 'adds error to admin job record' do
          described_class.perform_now(ai_artifact, user, admin_job_record, options)

          admin_job_record.reload
          expect(admin_job_record.error_messages).to include(
            I18n.t('admin.ai_artifact_result_generation_admin_job_failed',
                   artifact_name: ai_artifact.name,
                   user_email: user.email)
          )
        end

        it 'increments completed tasks after error' do
          described_class.perform_now(ai_artifact, user, admin_job_record, options)

          expect(admin_job_record).to have_received(:increment_completed_tasks!)
        end
      end
    end

    context 'without admin job record' do
      it 'does not raise error when admin_job_record is nil' do
        stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok)

        expect do
          described_class.perform_now(ai_artifact, user, nil, options)
        end.not_to raise_error
      end
    end
  end
end
