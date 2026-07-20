# frozen_string_literal: true

require 'rails_helper'

describe Auth::ClientConfigSerializer do
  let(:tenancy) { create(:tenancy) }
  let(:fallback_background) { 'https://example.com/bg.jpg' }

  subject(:result) do
    described_class.new(context: { background: fallback_background }).serialize(tenancy.reload)
  end

  it 'includes visual design fields' do
    expect(result.keys).to include(
      'background_color', 'login_box_position', 'background', 'background_overlay',
      'client_logo', 'secondary_logo', 'primary_color', 'error_color',
      'warning_color', 'success_color', 'info_color', 'background_size', 'logo_alt_text'
    )
  end

  it 'falls back to the context background when no background is set' do
    expect(result['background']).to eq(fallback_background)
  end

  it 'does not include project-only fields' do
    expect(result.keys).not_to include('id', 'require_mobile_number', 'hide_signup',
                                       'magic_link_enabled', 'disallow_password_login', 'enable_recaptcha')
  end

  context 'when the client has a design setting with a primary color' do
    before { tenancy.design_setting.update!(primary_color: '#123456') }

    it 'returns the primary color' do
      expect(result['primary_color']).to eq('#123456')
    end
  end

  context 'when the client has SSO enabled' do
    before do
      tenancy.client_sso_setting.update!(
        sso_enabled: true,
        idp_entity_id: 'https://idp.example.com/test',
        idp_sso_url: 'https://idp.example.com/sso/saml',
        idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
      )
    end

    it 'reflects saml_login_allowed' do
      expect(result['saml_login_allowed']).to be(true)
    end
  end
end
