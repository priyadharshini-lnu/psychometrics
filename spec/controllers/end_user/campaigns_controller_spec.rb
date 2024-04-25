# frozen_string_literal: true

require 'rails_helper'

describe EndUser::CampaignsController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:user2) { create(:user) }
  let!(:campaign) { create(:campaign, project: user.project) }
  let!(:registration_code) { create(:registration_code, project: campaign.project, campaign: campaign, use_count: 0) }

  before(:each) do
    login_user(user)
  end

  describe 'join with registratino code' do
    it 'should join campaign' do
      get :join_with_code, params: { code: registration_code.code }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_truthy
    end

    it 'should not join campaign if not enought registration codes' do
      registration_code.update(use_count: registration_code.total_count)
      get :join_with_code, params: { code: registration_code.code }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_falsey
    end
  end

  describe 'join with token' do
    it 'should join campaign' do
      token = ::Campaigns::JwtTokenizer.encode({ campaign_id: campaign.id, subject_id: user.id })
      get :join_with_token, params: { token: token }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_truthy
    end

    it 'should not join campaign if subject id not match' do
      token = ::Campaigns::JwtTokenizer.encode({ campaign_id: campaign.id, subject_id: user2.id })
      get :join_with_token, params: { token: token }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_falsey
    end
  end
end
