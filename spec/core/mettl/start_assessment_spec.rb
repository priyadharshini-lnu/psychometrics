# frozen_string_literal: true

require 'rails_helper'

describe Mettl::StartAssessment do
  include Rails.application.routes.url_helpers

  let(:config) { { 'public_key' => 'public_key_value', 'private_key' => 'private_key_value' } }
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, mettl_user_assessment: build(:mettl_user_assessment))
  end
  let!(:mettl_schedule_record) do
    create(:mettl_schedule_record, project: user_assessment.project, assessment: user_assessment.assessment)
  end

  let(:campaign) { user_assessment.campaign }

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:mettl_assessment_url) { Faker::Internet.url }

  let(:start_assessment) { described_class.new(context) }
  let!(:registration_response) do
    {
      'status' => 'SUCCESS',
      'registrationStatus' =>
        [{
          'email' => 'some_email@cc.com',
          'status' => 'ToBeTaken',
          'message' => "Candidate ('some_email@cc.com') successfully registered for the test",
          'url' => mettl_assessment_url
        }]
    }
  end

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: mettl_assessment_url
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
      let(:response) { instance_double(Faraday::Response, body: registration_response.to_json) }

      before(:each) do
        allow_any_instance_of(Mettl::RegisterCandidate).to receive(:config).and_return(config)
        allow_any_instance_of(Mettl::RegisterCandidate).to receive(:client).and_return(client)
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:body).and_return(registration_response.to_json)
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

      context 'when mettl user assessment has a URL' do
        let(:mettl_user_assessment) { create(:mettl_user_assessment, url: mettl_assessment_url) }

        it 'returns the redirect URL of the mettl user assessment' do
          async_response.response_data = mettl_assessment_url

          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end

      context 'when mettl user assessment does not have a URL' do
        before do
          allow(user_assessment).to receive(:mettl_user_assessment).and_return(nil)
        end

        it 'returns the redirect URL of the mettl user assessment' do
          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end

      context 'when registration_response does not have a URL' do
        it 'returns the redirect URL of the mettl user assessment' do
          registration_response['registrationStatus'] = [{
            'email' => 'some_email@cc.com',
            'status' => 'ToBeTaken',
            'message' => "Candidate ('some_email@cc.com') has completed the test",
            'url' => nil
          }]

          allow(response).to receive(:body).and_return(registration_response.to_json)

          response = start_assessment.call

          expect(response).to broadcast(:invalid)
        end
      end
    end
  end
end
