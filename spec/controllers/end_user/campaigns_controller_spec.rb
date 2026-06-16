# frozen_string_literal: true

require 'rails_helper'

describe EndUser::CampaignsController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:project) { user.project }
  let(:user2) { create(:user) }
  let!(:campaign) { create(:campaign, project: user.project) }
  let!(:registration_code) { create(:registration_code, project: campaign.project, campaign: campaign, use_count: 0) }

  before(:each) do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
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
      token = Campaigns::JwtTokenizer.encode({ campaign_id: campaign.id, subject_id: user.id })
      get :join_with_token, params: { token: token }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_truthy
    end

    it 'should not join campaign if subject id not match' do
      token = Campaigns::JwtTokenizer.encode({ campaign_id: campaign.id, subject_id: user2.id })
      get :join_with_token, params: { token: token }

      expect(campaign.campaign_users.exists?(user_id: user.id)).to be_falsey
    end
  end

  context 'when login with JWT' do
    before(:each) do
      sign_out(user)
    end

    let(:application_user) { create(:application_user) }
    let(:api_key) { create(:api_key, user: application_user) }
    let(:jwt_key) do
      JWT.encode({ 'sub' => user.id, 'exp' => Time.now.to_i + 20 }, api_key.token, 'HS256',
                 { 'api_key' => api_key.key })
    end

    it 'should login user' do
      get :show, params: { id: campaign.id, jwt: jwt_key }

      expect(session['sso']['user_id']).to eq(user.id)

      audit_log = AuditLog.last
      expect(audit_log.user_id).to eq(user.id)
      expect(audit_log.outcome).to eq('successful')
      expect(audit_log.action).to eq('sign_in_with_jwt')
    end

    it 'should not have jwt and return url in the response URL after login' do
      get :show, params: { id: campaign.id, jwt: jwt_key, return_url: '/some_url' }

      expect(response.location.include?('jwt')).to be_falsey
      expect(response.location.include?('return_url')).to be_falsey
    end

    it 'should not login user if token is invalid' do
      get :show, params: { id: campaign.id, jwt: 'invalid token' }

      expect(session['sso']).to be_nil
    end

    it 'logs audit log if token is invalid' do
      get :show, params: { id: campaign.id, jwt: 'invalid token' }

      audit_log = AuditLog.last

      expect(audit_log.user_id).to eq(nil)
      expect(audit_log.action).to eq('sign_in_with_jwt')
      expect(audit_log.outcome).to eq('failed')
      expect(audit_log.failure_reason).to eq('invalid_jwt_token')
    end
  end

  context 'when login with SSO token' do
    before(:each) do
      sign_out(user)
    end

    let(:sso_token) { 'sso_token' }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

    it 'login the user' do
      allow($redis).to receive(:get).with(user.sso_key).and_return(sso_token) # rubocop:disable Style/GlobalVars

      get :show, params: { id: campaign.id, user_id: user.id, sso_token: sso_token }

      expect(session['sso']['user_id']).to eq(user.id)
    end

    it 'Should not allow login if user not part of project' do
      user.update_column(:project_id, create(:project).id)

      get :show, params: { id: campaign.id, user_id: user.id, sso_token: sso_token }

      expect(session['warden.user.user.key']).to be_nil
    end
  end

  context 'when login with spoof token' do
    let(:spoof_token) { SecureRandom.urlsafe_base64(64) }

    before do
      user.update_column(:spoof_token, spoof_token)
      get :show, params: { id: campaign.id, spoof_token: spoof_token, return_url: '/some_url' }
    end

    it 'login the user, remove spoof_token and return_url' do
      expect(session[:spoofed]).to eq(true)

      expect(response.location.include?('spoof_token')).to be_falsey
      expect(response.location.include?('return_url')).to be_falsey
    end
  end
end
