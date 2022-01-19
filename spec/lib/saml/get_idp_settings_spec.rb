# frozen_string_literal: true

require 'rails_helper'

describe Saml::GetIdpSettings do
  describe '#settings' do
    it 'gets test setting' do
      saml_setting = create(:saml_setting, test_settings: { 'entity_id' => 'test_entity_id' }, entity_id: 'entity_id')
      result = described_class.new(saml_setting.project.subdomain, 'test').settings(nil)

      expect(result[:idp_entity_id]).to eq('test_entity_id')
    end

    it 'returns non test setting if setting type is nil' do
      saml_setting = create(:saml_setting, test_settings: { 'entity_id' => 'test_entity_id' }, entity_id: 'entity_id')
      result = described_class.new(saml_setting.project.subdomain, nil).settings(nil)

      expect(result[:idp_entity_id]).to eq('entity_id')
    end
  end
end
