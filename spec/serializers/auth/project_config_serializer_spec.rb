# frozen_string_literal: true

require 'rails_helper'

describe Auth::ProjectConfigSerializer do
  let(:project) { create(:project) }
  let(:fallback_background) { 'https://example.com/bg.jpg' }

  subject(:result) do
    described_class.new(context: { background: fallback_background }).serialize(project.reload)
  end

  before do
    project.design_setting.update!(
      primary_color: '#123456',
      error_color: '#ff0000',
      login_box_position: 'right',
      background_size: 'contain',
      logo_alt_text: 'Acme Corp',
      background_color: '#abcdef'
    )
  end

  context 'when project branding is enabled' do
    before { allow(Settings.features).to receive(:disable_project_branding).and_return(false) }

    it 'returns the project design settings' do
      expect(result).to include(
        'primary_color' => '#123456',
        'error_color' => '#ff0000',
        'login_box_position' => 'right',
        'background_size' => 'contain',
        'logo_alt_text' => 'Acme Corp',
        'background_color' => '#abcdef'
      )
    end

    it 'does not fall back to the platform background when the project sets a background color' do
      expect(result['background']).to be_nil
    end
  end

  context 'when project branding is disabled' do
    before { allow(Settings.features).to receive(:disable_project_branding).and_return(true) }

    it 'withholds every branding attribute' do
      expect(result).to include(
        'primary_color' => nil,
        'error_color' => nil,
        'warning_color' => nil,
        'success_color' => nil,
        'info_color' => nil,
        'login_box_position' => nil,
        'background_size' => nil,
        'logo_alt_text' => nil,
        'background_color' => nil,
        'client_logo' => nil,
        'secondary_logo' => nil,
        'background_overlay' => nil
      )
    end

    it 'serves the platform background instead of the project one' do
      expect(result['background']).to eq(fallback_background)
    end

    it 'leaves non-branding auth behaviour untouched' do
      expect(result).to include(
        'id' => project.id,
        'hide_signup' => project.registration_setting.hide_signup,
        'require_mobile_number' => project.registration_setting.require_mobile_number,
        'magic_link_enabled' => project.security_setting.magic_link_enabled,
        'disallow_password_login' => project.security_setting.disallow_password_login,
        'saml_login_allowed' => project.saml_login_allowed?
      )
    end
  end
end
