# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DomainEnforcementValidatable do
  let(:dummy_class) do
    Class.new do
      include ActiveModel::Model
      include ActiveModel::Validations
      include DomainEnforcementValidatable

      attr_accessor :domains, :enforce_all, :enforce_specific, :saml_enabled

      def enforce_for_all?
        enforce_all
      end

      def enforce_for_specific_domains?
        enforce_specific
      end

      def enforced_domains
        domains || []
      end

      def saml_login_allowed?
        saml_enabled
      end

      def self.name
        'DummyModel'
      end
    end
  end

  subject(:model) do
    dummy_class.new(
      domains: [],
      enforce_all: false,
      enforce_specific: false,
      saml_enabled: true
    )
  end

  describe 'domain validation' do
    context 'when enforce_for_specific_domains? is true' do
      before { model.enforce_specific = true }

      it 'is valid with proper domain patterns' do
        model.domains = ['example.com', '*.corp.com', 'sub.domain.org']
        expect(model).to be_valid
      end

      it 'is invalid with malformed domains' do
        model.domains = ['example.com', 'invalid_domain!', '*.']
        expect(model).not_to be_valid
        expect(model.errors[:enforced_domains]).to be_present
      end

      it 'is invalid with apex wildcard alone' do
        model.domains = ['*']
        expect(model).not_to be_valid
      end
    end

    context 'when enforce_for_specific_domains? is false' do
      before { model.enforce_specific = false }

      it 'does not validate domain patterns' do
        model.domains = ['invalid_domain!']
        expect(model).to be_valid
      end
    end
  end

  describe '#sso_enforced_for_email?' do
    context 'when SAML login is not allowed' do
      before do
        model.saml_enabled = false
        model.enforce_all = true
      end

      it 'returns false' do
        expect(model.sso_enforced_for_email?('test@example.com')).to be false
      end
    end

    context 'when enforce_for_all? is true' do
      before { model.enforce_all = true }

      it 'returns true regardless of email' do
        expect(model.sso_enforced_for_email?('test@example.com')).to be true
        expect(model.sso_enforced_for_email?(nil)).to be true
      end
    end

    context 'when enforce_for_specific_domains? is true' do
      before do
        model.enforce_specific = true
        model.domains = ['example.com', '*.corp.com']
      end

      it 'returns true for exact domain match' do
        expect(model.sso_enforced_for_email?('user@example.com')).to be true
      end

      it 'returns true for wildcard subdomain match' do
        expect(model.sso_enforced_for_email?('user@sub.corp.com')).to be true
        expect(model.sso_enforced_for_email?('user@nested.sub.corp.com')).to be true
      end

      it 'returns false for apex domain if wildcard is specified' do
        expect(model.sso_enforced_for_email?('user@corp.com')).to be false
      end

      it 'returns false for unmatched domains' do
        expect(model.sso_enforced_for_email?('user@other.com')).to be false
      end

      it 'is case insensitive' do
        expect(model.sso_enforced_for_email?('user@EXAMPLE.COM')).to be true
        expect(model.sso_enforced_for_email?('user@SUB.CORP.COM')).to be true
      end

      it 'returns false for missing email' do
        expect(model.sso_enforced_for_email?(nil)).to be false
        expect(model.sso_enforced_for_email?('')).to be false
      end
    end
  end
end
