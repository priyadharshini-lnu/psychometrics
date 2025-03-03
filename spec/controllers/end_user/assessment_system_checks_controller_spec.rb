# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::AssessmentSystemChecksController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) { create(:user_assessment, subject: user) }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'POST #step_completed' do
    let(:step_key) { 'system' }

    context 'when step_key is valid' do
      context 'when step_key is video' do
        let(:step_key) { 'video' }

        it 'sets the video and audio cookies' do
          post :step_completed,
               params: { user_assessment_id: user_assessment.id, step_key: step_key }

          expect(response).to have_http_status(:ok)
          expect(cookies['checking_wizard.video']).to be_present
          expect(cookies['checking_wizard.audio']).to be_present

          video_data = JSON.parse(cookies['checking_wizard.video'])
          expect(video_data[user_assessment.id.to_s]).to be_truthy
        end
      end

      context 'when step_key is not video' do
        it 'sets the general step cookie' do
          post :step_completed,
               params: { user_assessment_id: user_assessment.id, step_key: step_key }

          expect(response).to have_http_status(:ok)
          expect(cookies["checking_wizard.#{step_key}"]).to be_present
        end
      end
    end

    context 'when step_key is invalid' do
      let(:step_key) { 'invalid_step' }

      it 'returns an error' do
        post :step_completed,
             params: { user_assessment_id: user_assessment.id, step_key: step_key }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.body).to include('Invalid step key')
      end
    end

    context 'when user_assessment is not found' do
      it 'returns an error' do
        post :step_completed,
             params: { user_assessment_id: -1, step_key: step_key }

        expect(response).to have_http_status(:not_found)
        expect(response.body).to include('User assessment not found')
      end
    end
  end
end
