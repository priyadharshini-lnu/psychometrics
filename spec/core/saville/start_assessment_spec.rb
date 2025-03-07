# frozen_string_literal: true

require 'rails_helper'

describe Saville::StartAssessment do
  include Rails.application.routes.url_helpers

  before(:all) { savon.mock!   }
  after(:all)  { savon.unmock! }

  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, saville_user_assessment: build(:saville_user_assessment))
  end

  let(:campaign) { user_assessment.campaign }

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:saville_assessment_url) { 'https://saville.cc.com/assessment_id' }

  let(:start_assessment) { described_class.new(context) }

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: 'https://saville.cc.com/assessment_id'
    )
  end

  describe '#call' do
    context 'when user assessment is already completed' do
      before do
        user_assessment.complete!
      end

      it 'returns the redirect URL to the assessment completed path' do
        async_response.response_data = assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id)

        expect { start_assessment.call }.to broadcast(:ok, async_response)
      end
    end

    context 'when user assessment is not completed' do
      before(:each) do
        expect(Saville::MakeRequest).to receive(:call!).and_return({
          'AssessmentOrderAcknowledgement' => {
            'AccessPoint' => { 'InternetWebAddress' => saville_assessment_url }
          }
        })
      end

      it 'updates the started_at attribute of the user assessment' do
        expect(user_assessment.started_at).to be_nil

        start_assessment.call

        expect(user_assessment.reload.started_at).not_to be_nil
      end

      it 'sets the user assessment status to in progress' do
        expect(user_assessment.status).not_to eq('in_progress')

        start_assessment.call

        expect(user_assessment.reload.status).to eq('in_progress')
      end

      context 'when saville user assessment has a URL' do
        let(:saville_user_assessment) { create(:saville_user_assessment, url: saville_assessment_url) }

        it 'returns the redirect URL of the saville user assessment' do
          async_response.response_data = saville_user_assessment.url

          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end

      context 'when saville user assessment does not have a URL' do
        before do
          allow(user_assessment).to receive(:saville_user_assessment).and_return(nil)
        end

        it 'returns the redirect URL of the saville user assessment' do
          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end
    end
  end
end
