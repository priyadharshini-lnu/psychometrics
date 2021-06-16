# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SavilleUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, saville_user_assessment: build(:saville_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to campaign_path if user_assessment is completed' do
      user_assessment.completed!
      expect(::Saville::AssessmentOrderRequest).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(assessment_completed_path(campaign))
    end

    it "doesn't make AssessmentOrderRequest if assessment url is present" do
      url = 'https://tte-saville.com'
      user_assessment.saville_user_assessment.update(url: url)
      expect(::Saville::AssessmentOrderRequest).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(url)
    end

    it 'makes AssessmentOrderRequest if assessment url is not present and marks user_assessment in progress' do
      url = 'https://tte-saville.com'
      expect(::Saville::MakeRequest).to receive(:call!).and_return({
        'AssessmentOrderAcknowledgement' => {
          'AccessPoint' => { 'InternetWebAddress' => url }
        }
      })
      get :pass, params: { id: user_assessment.id }

      expect(user_assessment.reload.in_progress?).to eq(true)
      expect(response).to redirect_to(url)
    end
  end

  describe 'GET redirect' do
    it 'mark user_assessment as completed and redirect to campaign' do
      get :redirect, params: { id: user_assessment.id }

      expect(user_assessment.reload.completed?).to eq(true)
      expect(response).to redirect_to(assessment_completed_path(campaign))
    end
  end
end
