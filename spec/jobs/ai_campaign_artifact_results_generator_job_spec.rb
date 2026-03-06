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

  describe 'retry behavior with RubyLLM::Error' do
    let(:admin_job_record) { create(:admin_job_record) }
    let(:error_message) { 'Rate limit exceeded' }
    let(:ruby_llm_error) { RubyLLM::RateLimitError.new(nil, error_message) }
    let(:options) do
      {
        current_user: create(:user),
        force_regenerate: false
      }
    end

    before do
      stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, error_message, ruby_llm_error)
    end

    context 'when retries are exhausted' do
      it 'adds error to admin job record after all retries' do
        perform_enqueued_jobs do
          described_class.perform_later(ai_artifact, user, admin_job_record, options)
        end

        admin_job_record.reload
        expect(admin_job_record.error_messages).to include(
          I18n.t('admin.ai_artifact_result_generation_admin_job_failed',
                 artifact_name: ai_artifact.name,
                 user_email: user.email)
        )
      end

      it 'increments completed tasks after retries exhausted' do
        initial_completed_tasks = admin_job_record.completed_tasks

        perform_enqueued_jobs do
          described_class.perform_later(ai_artifact, user, admin_job_record, options)
        end

        admin_job_record.reload
        expect(admin_job_record.completed_tasks).to eq(initial_completed_tasks + 1)
      end
    end

    it 'retries 3 times before giving up' do
      call_count = 0
      allow(AI::CampaignArtifacts::ResultGenerator).to receive(:new).and_wrap_original do |method, *args|
        call_count += 1
        result_generator = method.call(*args)
        allow(result_generator).to receive(:call).and_raise(ruby_llm_error)
        result_generator
      end

      perform_enqueued_jobs do
        described_class.perform_later(ai_artifact, user, admin_job_record, options)
      end

      expect(call_count).to eq(3)
    end

    context 'when error is not RubyLLM::Error' do
      let(:standard_error) { StandardError.new('Some other error') }

      before do
        stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, 'Some other error',
                              standard_error)
      end

      it 'does not retry and adds error immediately' do
        call_count = 0
        allow(AI::CampaignArtifacts::ResultGenerator).to receive(:new).and_wrap_original do |method, *args|
          call_count += 1
          method.call(*args)
        end

        perform_enqueued_jobs do
          described_class.perform_later(ai_artifact, user, admin_job_record, options)
        end

        expect(call_count).to eq(1)
        admin_job_record.reload
        expect(admin_job_record.error_messages).to include(
          I18n.t('admin.ai_artifact_result_generation_admin_job_failed',
                 artifact_name: ai_artifact.name,
                 user_email: user.email)
        )
      end
    end
  end
end
