# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignResults::ScoringAndArtifactsGeneratorJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }

  describe '#perform' do
    it 'calls CampaignScoring::CalculateAndSave' do
      expect(CampaignScoring::CalculateAndSave).to receive(:call!).with(campaign, user)

      described_class.new.perform(campaign, user)
    end

    context 'when CampaignScoring::CalculateAndSave raises an exception' do
      it 'allows the exception to bubble up and does not execute after_perform' do
        expect(CampaignScoring::CalculateAndSave).to receive(:call!).with(campaign, user).
          and_raise(StandardError, 'Scoring calculation failed')
        expect(AI::CampaignArtifacts::Processor).not_to receive(:call)

        expect do
          described_class.new.perform(campaign, user)
        end.to raise_error(StandardError, 'Scoring calculation failed')
      end
    end

    describe 'AIArtifactResultsGeneration' do
      let(:client_feature) { double('client_feature', ai_assistants: true) }
      let(:client) { double('client', client_feature: client_feature) }

      before do
        allow(CampaignScoring::CalculateAndSave).to receive(:call!).with(campaign, user)
        allow(campaign).to receive(:client).and_return(client)
      end

      context 'when both platform and client AI assistant features are enabled' do
        before do
          allow(Settings.features).to receive(:[]).with(:ai_assistant_enabled).and_return(true)
          allow(client_feature).to receive(:ai_assistants).and_return(true)
        end

        it 'calls AI::CampaignArtifacts::Processor with correct arguments' do
          expect(AI::CampaignArtifacts::Processor).to receive(:call).with(campaign, user)
          allow(Rails.logger).to receive(:info)

          described_class.perform_now(campaign, user)
        end

        it 'logs the artifact generation' do
          expect(AI::CampaignArtifacts::Processor).to receive(:call).with(campaign, user)
          allow(Rails.logger).to receive(:info).and_call_original
          expect(Rails.logger).to receive(:info).with(
            "Generating AI artifacts results for campaign #{campaign.id}, user #{user.id}"
          ).and_call_original

          described_class.perform_now(campaign, user)
        end

        context 'when AI::CampaignArtifacts::Processor raises an exception' do
          it 'logs the error and captures exception with Sentry without failing the job' do
            error = StandardError.new('AI processing failed')
            expect(AI::CampaignArtifacts::Processor).to receive(:call).and_raise(error)
            allow(Rails.logger).to receive(:info).and_call_original
            allow(Rails.logger).to receive(:error).and_call_original
            expect(Rails.logger).to receive(:error).with(
              'Failed to generate AI artifacts results for campaign ' \
              "#{campaign.id}, user #{user.id}: AI processing failed"
            ).and_call_original
            expect(Sentry).to receive(:capture_exception).with(error)

            expect { described_class.perform_now(campaign, user) }.not_to raise_error
          end
        end
      end

      context 'when platform AI assistant feature is disabled' do
        before do
          allow(Settings.features).to receive(:[]).with(:ai_assistant_enabled).and_return(false)
          allow(client_feature).to receive(:ai_assistants).and_return(true)
        end

        it 'does not call AI::CampaignArtifacts::Processor' do
          expect(AI::CampaignArtifacts::Processor).not_to receive(:call)

          described_class.perform_now(campaign, user)
        end
      end

      context 'when client AI assistants feature is disabled' do
        before do
          allow(Settings.features).to receive(:[]).with(:ai_assistant_enabled).and_return(true)
          allow(client_feature).to receive(:ai_assistants).and_return(false)
        end

        it 'does not call AI::CampaignArtifacts::Processor' do
          expect(AI::CampaignArtifacts::Processor).not_to receive(:call)

          described_class.perform_now(campaign, user)
        end
      end

      context 'when both platform and client AI assistant features are disabled' do
        before do
          allow(Settings.features).to receive(:[]).with(:ai_assistant_enabled).and_return(false)
          allow(client_feature).to receive(:ai_assistants).and_return(false)
        end

        it 'does not call AI::CampaignArtifacts::Processor' do
          expect(AI::CampaignArtifacts::Processor).not_to receive(:call)

          described_class.perform_now(campaign, user)
        end
      end
    end
  end
end
