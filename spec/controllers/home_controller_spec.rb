# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomeController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:campaign_user) { create(:campaign_user, user: user) }
  let(:campaign) { campaign_user.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to agile_user_assessment' do
      assessment = create(:assessment, category: Assessment::AGILE)
      user_assessment = create(:user_assessment, evaluator: user, assessment: assessment, campaign: campaign)
      get :sso, params: { user_assessment_id: user_assessment.id, user_id: user.id, sso_token: 'abc' }

      expect(response).to redirect_to(user_assessment_path(user_assessment))
    end
  end
end
