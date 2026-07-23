# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ValidateReturnUrl do
  subject(:call_service) do
    described_class.call(return_url: return_url, application: application)
  end

  let(:application) { create(:application_user) }
  let(:return_url) { 'https://example.com/callback' }

  describe '.call' do
    context 'when return_url is blank' do
      let(:return_url) { nil }

      it 'returns ok with nil' do
        result = call_service

        expect(result[:ok]).to be_nil
      end
    end

    context 'when return_url format is invalid' do
      let(:return_url) { 'http://[invalid' }

      it 'returns invalid_return_url error' do
        result = call_service

        expect(result[:error]).to eq(:invalid_return_url)
      end
    end

    context 'when return_url has invalid placeholders' do
      let(:return_url) { 'https://example.com/callback?status=INVALID_PLACEHOLDER' }

      it 'returns invalid_return_url error' do
        result = call_service

        expect(result[:error]).to eq(:invalid_return_url)
      end
    end

    context 'when return_url has valid placeholders' do
      let(:return_url) { 'https://example.com/callback?status=ASSESSMENT_STATUS' }

      it 'returns ok with the URL' do
        result = call_service

        expect(result[:ok]).to eq(return_url)
      end
    end

    context 'when URL whitelisting is disabled' do
      let(:return_url) { 'https://example.com/callback' }

      before do
        application.application_setting.update(url_whitelisting_enabled: false)
      end

      it 'returns ok with the URL' do
        result = call_service

        expect(result[:ok]).to eq(return_url)
      end
    end

    context 'when URL whitelisting is enabled' do
      let(:application_setting) { application.application_setting }

      before do
        application_setting.update(url_whitelisting_enabled: true)
      end

      context 'when return_url is not in whitelist' do
        let(:return_url) { 'https://unauthorized.com/callback' }

        it 'returns url_not_whitelisted error' do
          result = call_service

          expect(result[:error]).to eq(:return_url_not_whitelisted)
        end
      end

      context 'when return_url matches exact whitelist entry' do
        let(:return_url) { 'https://example.com/callback' }

        before do
          create(:application_url_whitelist_entry, application_setting: application_setting, url: return_url)
        end

        it 'returns ok with the URL' do
          result = call_service

          expect(result[:ok]).to eq(return_url)
        end
      end

      context 'when return_url matches wildcard pattern in whitelist' do
        let(:return_url) { 'https://example.com/api/v1/callback' }

        before do
          create(:application_url_whitelist_entry, application_setting: application_setting, url: 'https://example.com/api/*')
        end

        it 'returns ok with the URL' do
          result = call_service

          expect(result[:ok]).to eq(return_url)
        end
      end

      context 'when return_url matches subdomain wildcard pattern in whitelist' do
        let(:return_url) { 'https://api.example.com/callback' }

        before do
          create(:application_url_whitelist_entry, application_setting: application_setting, url: 'https://*.example.com/*')
        end

        it 'returns ok with the URL' do
          result = call_service

          expect(result[:ok]).to eq(return_url)
        end
      end

      context 'when whitelist has disabled entry' do
        let(:return_url) { 'https://example.com/callback' }

        before do
          create(:application_url_whitelist_entry, application_setting: application_setting, url: return_url,
enabled: false)
        end

        it 'returns url_not_whitelisted error' do
          result = call_service

          expect(result[:error]).to eq(:return_url_not_whitelisted)
        end
      end
    end
  end
end
