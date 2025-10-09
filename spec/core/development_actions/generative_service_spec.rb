# frozen_string_literal: true

require 'rails_helper'

describe DevelopmentActions::GenerativeService do
  let!(:user) { create(:user) }
  let!(:user_idp_skill) { create(:user_idp_skill) }
  let(:options) { {} }
  let!(:session) { create(:assisted_user_development_actions_session, assistable: user_idp_skill, user: user) }
  let(:assistable_service) { instance_double(AI::AssistableService::DevelopmentActions) }

  before do
    allow(AI::AssistableService::DevelopmentActions).to receive(:new).
      with(user_idp_skill, user, options).
      and_return(assistable_service)
    allow(assistable_service).to receive(:session).and_return(session)
    allow(assistable_service).to receive(:call)
  end

  describe '#call' do
    context 'when service is not enabled' do
      before do
        allow(assistable_service).to receive(:assistable_enabled?).and_return(false)
      end

      it 'returns error with appropriate message' do
        result = described_class.call(user_idp_skill, user, options)

        expect(result[:error]).
          to eq(I18n.t('administration.ai_assistants.errors.development_actions_assistance_not_enabled'))
        expect(assistable_service).not_to have_received(:call)
      end
    end

    context 'when service is enabled' do
      before do
        allow(assistable_service).to receive(:assistable_enabled?).and_return(true)
      end

      context 'when generate_more is true' do
        let(:options) { { generate_more: true } }

        before do
          allow(assistable_service).to receive(:on).and_return(assistable_service)
          allow(assistable_service).to receive(:call)
        end

        it 'always calls the assistable service' do
          described_class.call(user_idp_skill, user, options)

          expect(assistable_service).to have_received(:call)
        end

        it 'calls assistable service even when existing actions are present' do
          # Set existing actions on the session
          session.update!(checkpoint: ['existing_action'])

          described_class.call(user_idp_skill, user, options)

          expect(assistable_service).to have_received(:call)
        end
      end

      context 'when generate_more is false' do
        let(:options) { { generate_more: false } }

        context 'when existing actions are present' do
          let(:existing_actions) { %w[action1 action2] }

          before do
            session.update!(checkpoint: existing_actions)
          end

          it 'returns existing actions without calling assistable service' do
            result = described_class.call(user_idp_skill, user, options)

            expect(result[:ok]).to eq(existing_actions)
            expect(assistable_service).not_to have_received(:call)
          end
        end

        context 'when existing actions are empty' do
          before do
            session.update!(checkpoint: [])
            allow(assistable_service).to receive(:on).and_return(assistable_service)
          end

          it 'calls assistable service' do
            described_class.call(user_idp_skill, user, options)

            expect(assistable_service).to have_received(:call)
          end
        end

        context 'when existing actions are nil' do
          before do
            session.update!(checkpoint: nil)
            allow(assistable_service).to receive(:on).and_return(assistable_service)
          end

          it 'calls assistable service' do
            described_class.call(user_idp_skill, user, options)

            expect(assistable_service).to have_received(:call)
          end
        end
      end

      context 'when assistable service succeeds' do
        let(:generated_actions) { %w[new_action1 new_action2] }

        before do
          session.update!(checkpoint: generated_actions)
          allow(assistable_service).to receive(:on).with(:ok) do |&block|
            @success_block = block
            assistable_service
          end
          allow(assistable_service).to receive(:on).with(:error) do
            assistable_service
          end
          allow(assistable_service).to receive(:call) do
            @success_block&.call
          end
        end

        it 'broadcasts success with generated actions from session' do
          result = described_class.call(user_idp_skill, user, options)

          expect(result[:ok]).to eq(generated_actions)
        end
      end

      context 'when assistable service fails' do
        let(:error_message) { 'Service failed' }

        before do
          allow(assistable_service).to receive(:on).with(:ok) do
            assistable_service
          end
          allow(assistable_service).to receive(:on).with(:error) do |&block|
            @error_block = block
            assistable_service
          end
          allow(assistable_service).to receive(:call) do
            @error_block&.call(error_message)
          end
        end

        it 'broadcasts error with the error message' do
          result = described_class.call(user_idp_skill, user, options)

          expect(result[:error]).to eq(error_message)
        end
      end
    end
  end
end
