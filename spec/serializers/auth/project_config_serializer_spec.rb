# frozen_string_literal: true

require 'rails_helper'

describe Auth::ProjectConfigSerializer do
  let(:project) { create(:project) }
  let(:fallback_background) { 'https://example.com/bg.jpg' }
  let(:glint_background) { 'https://example.com/glint-bg.jpg' }
  let(:context) { { background: fallback_background, glint_background: glint_background } }

  subject(:result) do
    described_class.new(context: context).serialize(project.reload)
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

  # Reads the attribute on its own; a bare object cannot go through the whole serializer.
  def glint_ui_for(object)
    described_class.new.tap { |serializer| serializer.instance_variable_set(:@object, object) }.glint_ui
  end

  describe 'glint_ui' do
    it 'is false when the project feature is off' do
      expect(result['glint_ui']).to be(false)
    end

    context 'when the project feature is on' do
      before { project.project_feature.update!(glint_ui: true) }

      it 'is true' do
        expect(result['glint_ui']).to be(true)
      end
    end

    # The devise layout serializes `@current_project || Client.new`, so the attribute is also
    # asked of objects that carry no project features.
    it 'is false for the project-less Client fallback' do
      expect(glint_ui_for(Client.new)).to be(false)
    end

    it 'is false for an object that does not respond to project_feature_enabled?' do
      expect(glint_ui_for(Object.new)).to be(false)
    end
  end

  describe 'background image fallback' do
    before { project.design_setting.update!(background_color: nil) }

    it 'uses the platform fallback when glint is off' do
      expect(result['background']).to eq(fallback_background)
    end

    context 'when glint is on' do
      before { project.project_feature.update!(glint_ui: true) }

      it 'uses the glint (admin default) background' do
        expect(result['background']).to eq(glint_background)
      end
    end

    context 'when glint is on and a background color is set but no image is uploaded' do
      before do
        project.project_feature.update!(glint_ui: true)
        project.design_setting.update!(background_color: '#000000')
      end

      it 'still uses the glint default image, since glint cannot render a solid color' do
        expect(result['background']).to eq(glint_background)
      end
    end
  end
end
