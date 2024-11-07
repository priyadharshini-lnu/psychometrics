# frozen_string_literal: true

require 'rails_helper'

describe Simulation::StartAssessment do
  include Rails.application.routes.url_helpers

  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, simulation_user_assessment: build(:simulation_user_assessment))
  end
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign, name: 'Group') }
  let!(:campaign_assessment) do
    create(:campaign_assessment, assessment: user_assessment.assessment, campaign: campaign, position: 1)
  end

  let(:campaign) { user_assessment.campaign }

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:simulation_assessment_url) { Faker::Internet.url }

  let(:start_assessment) { described_class.new(context) }

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: simulation_assessment_url
    )
  end

  let(:client) { double('Client') }

  before do
    allow_any_instance_of(::Simulation::RegisterParticipant).to receive(:client).and_return(client)
    allow(::Simulation::GetAssessmentUrl).to receive(:call).and_return({ ok: simulation_assessment_url })
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
      let(:response) { double('Response', status: 200, body: { id: 'participant_id' }.to_json) }

      before(:each) do
        allow(client).to receive(:put).and_return(response)
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

      context 'when simulation user assessment has a URL' do
        let(:simulation_user_assessment) { create(:simulation_user_assessment, participant_id: 'participant_id') }

        it 'returns the redirect URL of the simulation user assessment' do
          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
          expect(user_assessment.reload.status).to eq('in_progress')
        end
      end
    end
  end
end
