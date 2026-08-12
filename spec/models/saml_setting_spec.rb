# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SamlSetting, type: :model do
  describe '#sso_enforced_for_email?' do
    let(:saml_setting) { SamlSetting.new(enabled: true, enforce_for: enforce_for, enforced_domains: domains) }
    let(:enforce_for) { 'specific_domains' }
    let(:domains) { ['se.com', '*.corp.com'] }

    context 'when SSO is not allowed (disabled)' do
      let(:saml_setting) { SamlSetting.new(enabled: false, enforce_for: 'all') }

      it 'returns false' do
        expect(saml_setting.sso_enforced_for_email?('user@se.com')).to be false
      end
    end

    context 'when enforced for all' do
      let(:enforce_for) { 'all' }

      it 'returns true for any email' do
        expect(saml_setting.sso_enforced_for_email?('user@unknown.com')).to be true
      end
    end

    context 'when enforced for none' do
      let(:enforce_for) { 'none' }

      it 'returns false for any email' do
        expect(saml_setting.sso_enforced_for_email?('user@se.com')).to be false
      end
    end

    context 'when enforced for specific domains' do
      it 'returns true for exact domain match' do
        expect(saml_setting.sso_enforced_for_email?('user@se.com')).to be true
      end

      it 'matches case-insensitively' do
        expect(saml_setting.sso_enforced_for_email?('user@SE.COM')).to be true
      end

      it 'returns true for subdomain match on wildcard' do
        expect(saml_setting.sso_enforced_for_email?('user@sub.corp.com')).to be true
      end

      it 'returns false for apex domain if wildcard is specified' do
        expect(saml_setting.sso_enforced_for_email?('user@corp.com')).to be false
      end

      it 'returns false for unmatched domains' do
        expect(saml_setting.sso_enforced_for_email?('user@gmail.com')).to be false
      end

      it 'returns false if email is blank' do
        expect(saml_setting.sso_enforced_for_email?(nil)).to be false
        expect(saml_setting.sso_enforced_for_email?('')).to be false
      end
    end
  end

  describe '#validate_domain_patterns' do
    it 'validates correct patterns' do
      setting = SamlSetting.new(enforce_for: 'specific_domains', enforced_domains: ['example.com', '*.sub.example.com'])
      setting.valid?
      expect(setting.errors[:enforced_domains]).to be_empty
    end

    it 'adds errors for empty domains when enforced for specific_domains' do
      setting = SamlSetting.new(enforce_for: 'specific_domains', enforced_domains: [])
      setting.valid?
      expect(setting.errors[:enforced_domains]).to include("can't be blank")
    end

    it 'adds errors for invalid patterns' do
      setting = SamlSetting.new(enforce_for: 'specific_domains', enforced_domains: ['-invalid.com', '*.com'])
      setting.valid?
      expect(setting.errors[:enforced_domains]).to be_present
    end
  end

  describe 'sync_enforced_boolean callback' do
    let(:project) { create(:tenancy) }
    let(:saml_setting) { build(:saml_setting, project: project) }

    it 'sets enforced to true when enforce_for is all' do
      saml_setting.enforce_for = 'all'
      saml_setting.save(validate: false)
      expect(saml_setting.enforced).to be true
    end

    it 'sets enforced to false when enforce_for is specific_domains' do
      saml_setting.enforce_for = 'specific_domains'
      saml_setting.enforced = true
      saml_setting.save(validate: false)
      expect(saml_setting.enforced).to be false
    end

    it 'sets enforced to false when enforce_for is none' do
      saml_setting.enforce_for = 'none'
      saml_setting.enforced = true
      saml_setting.save(validate: false)
      expect(saml_setting.enforced).to be false
    end
  end
end
