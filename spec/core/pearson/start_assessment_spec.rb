# frozen_string_literal: true

require 'rails_helper'

describe Pearson::StartAssessment do
  include Rails.application.routes.url_helpers

  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, pearson_user_assessment: build(:pearson_user_assessment))
  end

  let(:campaign) { user_assessment.campaign }

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:pearson_assessment_url) { Faker::Internet.url }

  let(:schedule_id) { Faker::Lorem.characters(number: 5) }
  let(:stubbed_response) do
    double('response',
           body: { 'data' => { 'scheduleId' => schedule_id,
                               'urls' => [{ 'url' => pearson_assessment_url }] } }.to_json)
  end

  let(:start_assessment) { described_class.new(context) }

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: pearson_assessment_url
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
        allow_any_instance_of(Assessment).to receive(:external_assessment_id).and_return('123')
        allow_any_instance_of(Pearson::CreateSchedule).to receive(:client).and_return(double('client',
                                                                                             post: stubbed_response))
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

      context 'when pearson user assessment has a URL' do
        let(:pearson_user_assessment) { create(:pearson_user_assessment, url: pearson_assessment_url) }

        it 'returns the redirect URL of the pearson user assessment' do
          async_response.response_data = pearson_assessment_url

          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end

      context 'when pearson user assessment does not have a URL' do
        before do
          allow(user_assessment).to receive(:pearson_user_assessment).and_return(nil)
        end

        it 'returns the redirect URL of the pearson user assessment' do
          response = start_assessment.call

          expect(response).to broadcast(:ok, async_response)
        end
      end
    end
  end
end
