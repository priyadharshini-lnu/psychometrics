# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::MindmillUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) { create(:user_assessment, evaluator: user) }
  let(:campaign) { user_assessment.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to root_path if user_assessment is completed' do
      user_assessment.update(status: :completed)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(campaign_path(campaign))
    end

    it "redirects to root_path if ::Mindmill::GetSsoUrl doesn't return ssol_url" do
      allow(::Mindmill::GetSsoUrl).to receive(:call!).and_return(nil)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(campaign_path(campaign))
    end

    it 'redirects to sso_url if ::Mindmill::GetSsoUrl returns a url' do
      allow(::Mindmill::GetSsoUrl).to receive(:call!).and_return('http://mm.com/sso=1')

      get :pass, params: { id: user_assessment.id }

      ssol_url = "http://mm.com/sso=1&URL=#{request.base_url}#{redirect_mindmill_user_assessment_path(user_assessment.id)}"
      expect(response).to redirect_to(ssol_url)
    end
  end

  describe 'GET redirect' do
    it 'calls Mindmill::LoadResultsJob job if user_assessment is not completed' do
      expect(::Mindmill::LoadResultsJob).to receive(:perform_now)

      get :redirect, params: { id: user_assessment.id }
    end

    it "doesn't call Mindmill::LoadResultsJob job if user_assessment is completed" do
      user_assessment.update(status: :completed)
      expect(::Mindmill::LoadResultsJob).to_not receive(:perform_now)

      get :redirect, params: { id: user_assessment.id }
    end

    it 'redirects to root_path' do
      allow(::Mindmill::LoadResultsJob).to receive(:perform_now)

      get :redirect, params: { id: user_assessment.id }

      expect(response).to redirect_to(campaign_path(campaign))
    end
  end
end
