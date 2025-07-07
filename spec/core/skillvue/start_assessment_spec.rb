# frozen_string_literal: true

require 'rails_helper'

describe Skillvue::StartAssessment do
  include Rails.application.routes.url_helpers
  let(:config) { { 'api_key' => 'api_key' } }
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, skillvue_user_assessment: build(:skillvue_user_assessment))
  end

  let(:campaign) { user_assessment.campaign }

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:skillvue_assessment_url) { Faker::Internet.url }

  let(:start_assessment) { described_class.new(context) }
  let!(:invitation_response) do
    {
      'success' => true,
      'error' => nil,
      'data' => {
        'interview_url' => skillvue_assessment_url,
        'candidate' => {
          'id' => 'WY5P7W',
          'name' => '23740',
          'surname' => '23740',
          'email' => 'wy5p7w-ac068a3c0a@example.com',
          'redirect_url' => 'https://mercer.ttedev.me:3030/simulation_user_assessments/26110/redirect?jwt=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzNzQwLCJleHAiOjE3NTE1MjkyODN9.eWwvIlBLN2Jhsa8eHi6Sy2Ozc-bO7Qsx3_dli0ZKW10&project_id=288'
        }
      }
    }
  end

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: skillvue_assessment_url
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
      let(:client) { instance_double(Faraday::Connection) }
      let(:response) { instance_double(Faraday::Response, body: invitation_response.to_json) }

      before(:each) do
        allow_any_instance_of(Skillvue::InviteCandidate).to receive(:config).and_return(config)
        allow_any_instance_of(Skillvue::InviteCandidate).to receive(:client).and_return(client)
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:body).and_return(invitation_response.to_json)
        allow(response).to receive(:success?).and_return(true)
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

      context 'when skillvue user assessment has a URL' do
        let(:skillvue_user_assessment) { create(:skillvue_user_assessment, url: skillvue_assessment_url) }

        it 'returns the redirect URL of the skillvue user assessment' do
          async_response.response_data = skillvue_assessment_url

          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end

      context 'when skillvue user assessment does not have a URL' do
        before do
          user_assessment.skillvue_user_assessment.update!(url: nil)
        end

        it 'returns the redirect URL of the skillvue user assessment' do
          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end
    end
  end
end
