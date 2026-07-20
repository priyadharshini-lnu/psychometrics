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

  describe 'GET cookies_statement' do
    it 'redirects to locale specific cookie notice url' do
      get :cookies_statement, params: { lang: 'fr-CA' }

      expect(response).to redirect_to('https://www.mercer.com/fr-ca/regulatory/mercer-cookie-notice/')
    end

    it 'redirects to global english cookie notice url for unknown locale' do
      get :cookies_statement, params: { lang: 'xx-YY' }

      expect(response).to redirect_to('https://www.mercer.com/regulatory/mercer-cookie-notice/')
    end

    it 'does not allow host override through locale param' do
      get :cookies_statement, params: { lang: '//evil.com' }

      expect(response).to redirect_to('https://www.mercer.com/regulatory/mercer-cookie-notice/')
    end
  end

  describe '#assessment_completed with post login jwt' do
    let(:project) { user.project }

    before do
      request.host = "#{project.subdomain}.#{Settings.domain}"
    end

    it 'redirects to return_url with assessment_completed for jwt_post session' do
      campaign_user.update!(completion_status: :completed)
      session[:sso] = {
        'user_id' => user.id,
        'return_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS",
        'source' => 'jwt_post'
      }

      get :assessment_completed

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=assessment_completed"
      )
    end

    it 'redirects to return_url with assessment_completed for jwt_post assessment session' do
      user_assessment = create(
        :user_assessment,
        campaign: campaign,
        evaluator: user,
        subject: user,
        status: :completed
      )
      session[:sso] = {
        'user_id' => user.id,
        'return_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS",
        'user_assessment_id' => user_assessment.id,
        'source' => 'jwt_post'
      }

      get :assessment_completed

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=assessment_completed"
      )
    end

    it 'redirects to valid optional return_url after successful completion without placeholder substitution' do
      campaign_user.update!(completion_status: :completed)
      session[:sso] = {
        'user_id' => user.id,
        'return_url' => "https://#{project.subdomain}.#{Settings.domain}/done",
        'source' => 'jwt_post'
      }

      get :assessment_completed

      expect(response).to redirect_to("https://#{project.subdomain}.#{Settings.domain}/done")
    end
  end

  describe '#assessment_completed status normalization with post login jwt' do
    let(:project) { user.project }

    before do
      request.host = "#{project.subdomain}.#{Settings.domain}"
    end

    it 'maps unsupported assessment status to assessment_pending for jwt_post source' do
      user_assessment = create(
        :user_assessment,
        campaign: campaign,
        evaluator: user,
        subject: user,
        status: :ineligible
      )
      session[:sso] = {
        'user_id' => user.id,
        'return_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS",
        'user_assessment_id' => user_assessment.id,
        'source' => 'jwt_post'
      }

      get :assessment_completed

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=assessment_pending"
      )
    end

    it 'keeps unsupported assessment status as-is when source is not jwt_post' do
      user_assessment = create(
        :user_assessment,
        campaign: campaign,
        evaluator: user,
        subject: user,
        status: :ineligible
      )
      session[:sso] = {
        'user_id' => user.id,
        'return_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS",
        'user_assessment_id' => user_assessment.id,
        'source' => 'sso'
      }

      get :assessment_completed

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=assessment_ineligible"
      )
    end
  end
end
