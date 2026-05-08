# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessments::FinishProctoringSession, type: :model do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, project: project) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, subject: user, evaluator: user)
  end
  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:service) { described_class.new(context) }

  before do
    campaign_user # ensure creation
    allow_any_instance_of(EndUser::CampaignUserSerializer).
      to receive(:serialize).
      and_return({})
  end

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: {}
    )
  end

  describe '#call' do
    context 'when proctoring is enabled' do
      before do
        allow_any_instance_of(UserAssessment).to receive(:proctoring_enabled?).and_return(true)
      end

      context 'when proctoring session exists and is ended successfully' do
        before do
          allow_any_instance_of(UserAssessment).to receive(:finish_proctoring_session).and_return(true)
        end

        it 'calls user_assessment.finish_proctoring_session' do
          expect_any_instance_of(UserAssessment).to receive(:finish_proctoring_session)
          expect { service.call }.to broadcast(:ok, async_response)
        end
      end
    end

    context 'when proctoring is not enabled' do
      before do
        allow_any_instance_of(UserAssessment).to receive(:proctoring_enabled?).and_return(false)
      end

      let(:empty_async_response) do
        AsyncResponseRequest::AsyncResponse.new(
          processing_status: :completed,
          response_type: :json,
          response_data: {}
        )
      end

      it 'returns invalid response' do
        expect { service.call }.to broadcast(:invalid, empty_async_response)
      end
    end
  end
end
