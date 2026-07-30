# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtLoginController, type: :controller do
  let(:project) { create(:project) }
  let(:participant) { create(:user, project: project) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: participant, active: true) }
  let(:application_user) { create(:application_user, tenant: project.client) }
  let(:rsa_private_key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:key_id) { SecureRandom.random_number(ApplicationPublicKey::MIN_KEY_ID..ApplicationPublicKey::MAX_KEY_ID) }
  let!(:public_key) do
    create(
      :application_public_key,
      user: application_user,
      key_id: key_id,
      public_key: rsa_private_key.public_key.to_pem,
      disabled: false
    )
  end

  before do
    @request.env['devise.mapping'] = Devise.mappings[:user]
    request.host = "#{project.subdomain}.#{Settings.domain}"
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
  end

  describe '#login_jwt' do
    it 'rejects missing token' do
      post :login_jwt, params: {}

      expect(response).to have_http_status(:unauthorized)
    end

    it 'authenticates and redirects to campaign for valid cmp token' do
      token = build_token('tg' => 'cmp', 'tg_cmp_id' => campaign.id.to_s)

      post :login_jwt, params: { token: token }

      expect(response).to redirect_to(campaign_path(campaign))
      expect(controller.current_user).to eq(participant)
    end

    it 'authenticates and redirects to assessment for valid asmt token' do
      user_assessment = create(:user_assessment, campaign: campaign, evaluator: participant, subject: participant)
      token = build_token(
        'tg' => 'asmt',
        'tg_cmp_id' => campaign.id.to_s,
        'tg_asmt_id' => user_assessment.id.to_s
      )

      post :login_jwt, params: { token: token }

      expect(response).to redirect_to(user_assessment_path(user_assessment))
      expect(controller.current_user).to eq(participant)
    end

    it 'redirects to return_url with pending status on single-use replay' do
      ret_url = "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS"
      token = build_token(
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'single_use' => true,
        'ret_url' => ret_url
      )

      post :login_jwt, params: { token: token }
      sign_out(participant)
      post :login_jwt, params: { token: token }

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=campaign_pending"
      )
    end

    it 'redirects to return_url with assessment pending status on single-use replay for asmt target' do
      user_assessment = create(:user_assessment, campaign: campaign, evaluator: participant, subject: participant)
      ret_url = "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS"
      token = build_token(
        'tg' => 'asmt',
        'tg_cmp_id' => campaign.id.to_s,
        'tg_asmt_id' => user_assessment.id.to_s,
        'single_use' => true,
        'ret_url' => ret_url
      )

      post :login_jwt, params: { token: token }
      sign_out(participant)
      post :login_jwt, params: { token: token }

      expect(response).to redirect_to(
        "https://#{project.subdomain}.#{Settings.domain}/done?status=assessment_pending"
      )
    end

    it 'returns unprocessable entity when replay happens without return_url' do
      token = build_token(
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'single_use' => true
      )

      post :login_jwt, params: { token: token }
      sign_out(participant)
      post :login_jwt, params: { token: token }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
    end

    it 'accepts token reuse when single_use is false' do
      token = build_token('tg' => 'cmp', 'tg_cmp_id' => campaign.id.to_s, 'single_use' => false)

      post :login_jwt, params: { token: token }
      sign_out(participant)
      post :login_jwt, params: { token: token }

      expect(response).to redirect_to(campaign_path(campaign))
    end

    it 'rejects malformed token safely' do
      post :login_jwt, params: { token: 'invalid' }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
      expect(response.body).not_to include('invalid')
    end

    it 'rejects token with invalid signature' do
      forged_private_key = OpenSSL::PKey::RSA.generate(2048)
      forged_token = JWT.encode(
        {
          'iss' => application_user.id.to_s,
          'jti' => SecureRandom.uuid,
          'aud' => Jwt::BuildAudience.call!(application: application_user),
          'exp' => 15.minutes.from_now.to_i,
          'sub' => participant.id.to_s,
          'kid' => key_id,
          'tg' => 'cmp',
          'tg_cmp_id' => campaign.id.to_s
        },
        forged_private_key,
        'RS256',
        { kid: key_id }
      )

      post :login_jwt, params: { token: forged_token }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
      expect(response).not_to be_redirect
    end

    it 'rejects unsupported algorithm' do
      hs_token = JWT.encode({ iss: application_user.id }, 'secret', 'HS256', { kid: key_id })

      post :login_jwt, params: { token: hs_token }

      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects audience with path' do
      token = build_token(
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'aud' => "https://#{project.subdomain}.#{Settings.domain}/some/path"
      )

      post :login_jwt, params: { token: token }

      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects expired token' do
      token = build_token(
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'exp' => 1.minute.ago.to_i
      )

      post :login_jwt, params: { token: token }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
    end

    it 'rejects expired token even when single_use is true and return_url is provided' do
      token = build_token(
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'single_use' => true,
        'ret_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS",
        'exp' => 1.minute.ago.to_i
      )

      post :login_jwt, params: { token: token }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
    end

    it 'does not redirect to ret_url for an unverifiable token containing ret_url claim' do
      forged_private_key = OpenSSL::PKey::RSA.generate(2048)
      forged_payload = {
        'iss' => application_user.id.to_s,
        'jti' => SecureRandom.uuid,
        'aud' => Jwt::BuildAudience.call!(application: application_user),
        'exp' => 15.minutes.from_now.to_i,
        'sub' => participant.id.to_s,
        'kid' => key_id,
        'tg' => 'cmp',
        'tg_cmp_id' => campaign.id.to_s,
        'ret_url' => "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS"
      }
      forged_token = JWT.encode(forged_payload, forged_private_key, 'RS256', { kid: key_id })

      post :login_jwt, params: { token: forged_token }

      expect(response).to have_http_status(:unauthorized)
      expect(response.body).to eq(I18n.t('shared.authentication_failed'))
      expect(response).not_to be_redirect
    end

    context 'when URL whitelisting is enabled' do
      before do
        create(:application_url_whitelist_entry,
               application_setting: application_user.application_setting,
               url: 'https://example.com/api/*')
        application_user.application_setting.update(url_whitelisting_enabled: true)
      end

      it 'rejects return_url not in the whitelist' do
        token = build_token(
          'tg' => 'cmp',
          'tg_cmp_id' => campaign.id.to_s,
          'ret_url' => 'https://unauthorized.com/callback'
        )

        post :login_jwt, params: { token: token }

        expect(response).to have_http_status(:bad_request)
        expect(response.body).to eq(I18n.t('shared.return_url_not_whitelisted'))
      end

      it 'accepts return_url matching a whitelisted wildcard pattern' do
        token = build_token(
          'tg' => 'cmp',
          'tg_cmp_id' => campaign.id.to_s,
          'ret_url' => 'https://example.com/api/v1/callback'
        )

        post :login_jwt, params: { token: token }

        expect(response).to redirect_to(campaign_path(campaign))
        expect(controller.current_user).to eq(participant)
      end
    end
  end

  private

  def build_token(overrides = {})
    payload = {
      'iss' => application_user.id.to_s,
      'jti' => SecureRandom.uuid,
      'aud' => Jwt::BuildAudience.call!(application: application_user),
      'exp' => 15.minutes.from_now.to_i,
      'sub' => participant.id.to_s,
      'kid' => key_id
    }.merge(overrides)

    JWT.encode(payload, rsa_private_key, 'RS256', { kid: key_id })
  end
end
