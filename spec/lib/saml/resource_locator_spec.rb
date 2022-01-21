# frozen_string_literal: true

require 'rails_helper'

describe Saml::ResourceLocator do
  describe '.call' do
    it 'find record from the model passed pased on the acs url' do
      user = create(:user, :with_project_membership)
      subdomain = user.project.subdomain
      saml_response = double(raw_response: double(destination: "https://#{subdomain}.example.com"))
      described_class.call(User, saml_response, user.email)
    end

    it 'returns nil if user with email is present but is part of different project subdomain' do
      user = create(:user, :with_project_membership)
      other_project_subdomain = create(:project).subdomain
      saml_response = double(raw_response: double(destination: "https://#{other_project_subdomain}.example.com"))
      described_class.call(User, saml_response, user.email)
    end
  end
end
