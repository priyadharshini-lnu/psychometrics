# frozen_string_literal: true

require 'rails_helper'

describe Saml::GetIdentityProviderSettings do
  describe '#settings' do
    it 'returns setting' do
      saml_setting = create(:saml_setting, test_settings: { 'entity_id' => 'test_entity_id' }, entity_id: 'entity_id')
      result = described_class.new(saml_setting.project.subdomain).settings(nil)

      expect(result[:idp_entity_id]).to eq('entity_id')
    end
  end
end
