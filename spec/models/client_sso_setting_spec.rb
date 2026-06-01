# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClientSsoSetting, type: :model do
  let(:tenancy) { create(:tenancy) }
  let(:sso_setting) { tenancy.client_sso_setting }

  describe 'associations' do
    it { should belong_to(:client) }
  end

  describe 'default state' do
    it 'is created with SSO disabled and no session timeout' do
      expect(sso_setting).to be_persisted
      expect(sso_setting.sso_enabled).to be false
      expect(sso_setting.sso_enforced).to be false
      expect(sso_setting.session_timeout).to be_nil
      expect(sso_setting.allowed_domains).to eq([])
    end
  end

  describe 'validations when SSO is disabled' do
    it 'is valid without IdP fields' do
      sso_setting.assign_attributes(sso_enabled: false, idp_entity_id: nil, idp_sso_url: nil, idp_cert: nil)
      expect(sso_setting).to be_valid
    end
  end

  describe 'validations when SSO is enabled' do
    let(:valid_cert) { Rails.root.join('spec/fixtures/files/cert.pem').read }

    it 'requires idp_entity_id, idp_sso_url, and idp_cert' do
      sso_setting.sso_enabled = true

      expect(sso_setting).not_to be_valid
      expect(sso_setting.errors[:idp_entity_id]).to include("can't be blank")
      expect(sso_setting.errors[:idp_sso_url]).to include("can't be blank")
      expect(sso_setting.errors[:idp_cert]).to include("can't be blank")
    end

    it 'is valid with all required IdP fields' do
      sso_setting.assign_attributes(
        sso_enabled: true,
        idp_entity_id: 'https://idp.example.com',
        idp_sso_url: 'https://idp.example.com/sso',
        idp_cert: valid_cert
      )

      expect(sso_setting).to be_valid
    end

    it 'rejects an invalid certificate' do
      sso_setting.assign_attributes(
        sso_enabled: true,
        idp_entity_id: 'https://idp.example.com',
        idp_sso_url: 'https://idp.example.com/sso',
        idp_cert: 'not-a-valid-cert'
      )

      expect(sso_setting).not_to be_valid
      expect(sso_setting.errors[:idp_cert]).to include('is invalid')
    end
  end

  describe 'sso_enforced validation' do
    it 'cannot be enforced when SSO is disabled' do
      sso_setting.assign_attributes(sso_enabled: false, sso_enforced: true)

      expect(sso_setting).not_to be_valid
      expect(sso_setting.errors[:sso_enforced]).to be_present
    end

    it 'can be enforced when SSO is enabled' do
      valid_cert = Rails.root.join('spec/fixtures/files/cert.pem').read
      sso_setting.assign_attributes(
        sso_enabled: true,
        sso_enforced: true,
        idp_entity_id: 'https://idp.example.com',
        idp_sso_url: 'https://idp.example.com/sso',
        idp_cert: valid_cert
      )

      expect(sso_setting).to be_valid
    end
  end

  describe 'session_timeout validation' do
    it 'normalizes zero to nil' do
      sso_setting.session_timeout = 0
      sso_setting.valid?

      expect(sso_setting.session_timeout).to be_nil
    end

    it 'rejects negative values' do
      sso_setting.session_timeout = -1

      expect(sso_setting).not_to be_valid
    end
  end

  describe 'allowed_domains' do
    it 'stores an array of domains' do
      sso_setting.update!(allowed_domains: ['acme.com', 'example.org'])

      expect(sso_setting.reload.allowed_domains).to eq(['acme.com', 'example.org'])
    end
  end

  describe '#saml_login_allowed?' do
    it 'returns true when SSO is enabled' do
      sso_setting = build(:client_sso_setting, :enabled)
      expect(sso_setting.saml_login_allowed?).to be true
    end

    it 'returns false when SSO is disabled' do
      expect(sso_setting.saml_login_allowed?).to be false
    end
  end

  describe '#saml_enforced?' do
    it 'returns true when SSO is enabled and enforced' do
      sso_setting = build(:client_sso_setting, :enforced)
      expect(sso_setting.saml_enforced?).to be true
    end

    it 'returns false when SSO is enabled but not enforced' do
      sso_setting = build(:client_sso_setting, :enabled, sso_enforced: false)
      expect(sso_setting.saml_enforced?).to be false
    end

    it 'returns false when SSO is disabled' do
      expect(sso_setting.saml_enforced?).to be false
    end
  end

  describe '#email_domain_allowed?' do
    it 'returns true when allowed_domains is empty' do
      expect(sso_setting.email_domain_allowed?('user@any.com')).to be true
    end

    it 'returns true when email domain matches' do
      sso_setting.allowed_domains = ['acme.com']
      expect(sso_setting.email_domain_allowed?('user@acme.com')).to be true
    end

    it 'returns false when email domain does not match' do
      sso_setting.allowed_domains = ['acme.com']
      expect(sso_setting.email_domain_allowed?('user@other.com')).to be false
    end

    it 'is case-insensitive' do
      sso_setting.allowed_domains = ['Acme.Com']
      expect(sso_setting.email_domain_allowed?('user@acme.com')).to be true
    end
  end

  describe '#saml_settings' do
    let(:sso_setting) { build(:client_sso_setting, :enabled) }
    let(:url_options) { { host: 'example.com', subdomain: 'test-admin', protocol: 'https', port: nil } }

    it 'returns a hash with SAML settings' do
      settings = sso_setting.saml_settings(url_options)

      expect(settings[:idp_entity_id]).to eq(sso_setting.idp_entity_id)
      expect(settings[:idp_sso_service_url]).to eq(sso_setting.idp_sso_url)
      expect(settings[:idp_cert]).to eq(sso_setting.idp_cert)
      expect(settings[:assertion_consumer_service_binding]).to eq('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST')
      expect(settings[:name_identifier_format]).to eq('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress')
    end
  end

  describe 'Client integration' do
    it 'is auto-created for new tenancies' do
      new_tenancy = create(:tenancy)

      expect(new_tenancy.client_sso_setting).to be_persisted
      expect(new_tenancy.client_sso_setting.sso_enabled).to be false
    end

    it 'is destroyed when client is destroyed' do
      setting_id = sso_setting.id
      tenancy.destroy

      expect(ClientSsoSetting.find_by(id: setting_id)).to be_nil
    end
  end
end
