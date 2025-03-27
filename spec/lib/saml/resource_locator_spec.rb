# frozen_string_literal: true

require 'rails_helper'

describe Saml::ResourceLocator do
  let(:issuers) { ['tte.test'] }

  before do
    allow(Settings.saml).to receive(:idp_entity_id).and_return('tte.test')
  end

  describe '.call' do
    it 'finds the record from the model based on the ACS URL' do
      user = create(:user, :with_project_membership)
      subdomain = user.project.subdomain
      saml_response = double(raw_response: double(destination: "https://#{subdomain}.example.com",
                                                  issuers: 'project_specific_issuers'))
      result = described_class.call(User, saml_response, user.email)
      expect(result).to eq(user)
    end

    it 'returns nil if user with email is present but is part of a different project subdomain' do
      user = create(:user, :with_project_membership)
      other_project_subdomain = create(:project).subdomain
      saml_response = double(raw_response: double(destination: "https://#{other_project_subdomain}.example.com",
                                                  issuers: 'project_specific_issuers'))
      result = described_class.call(User, saml_response, user.email)
      expect(result).to be_nil
    end

    it 'finds the admin user by auth value when the issuer matches the admin SAML issuer' do
      admin_user = create(:superadmin, email: 'admin@example.com')
      saml_response = double(raw_response: double(destination: 'https://admin.example.com', issuers: ['tte.test']))
      result = described_class.call(User, saml_response, admin_user.email)
      expect(result).to eq(admin_user)
    end
  end
end
