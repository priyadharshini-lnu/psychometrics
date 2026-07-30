# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationUrlWhitelistEntry, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:application) { create(:application_user, tenant: tenant) }
  let(:setting) { application.application_setting }

  subject(:entry) { build(:application_url_whitelist_entry, application_setting: setting) }

  describe 'validations' do
    it { is_expected.to be_valid }

    it 'is invalid without url' do
      entry.url = nil
      expect(entry).not_to be_valid
      expect(entry.errors[:url]).to be_present
    end

    it 'is invalid with a malformed URL' do
      entry.url = 'not-a-valid-url'
      expect(entry).not_to be_valid
      expect(entry.errors[:url]).to be_present
    end

    it 'is valid with a well-formed URL' do
      entry.url = 'https://example.com/callback'
      expect(entry).to be_valid
    end
  end

  describe '#matches_url?' do
    it 'returns false for a blank URL' do
      expect(entry.matches_url?(nil)).to be false
    end

    it 'matches exact host with or without trailing slash' do
      entry.url = 'https://example.com/'

      expect(entry.matches_url?('https://example.com')).to be true
      expect(entry.matches_url?('https://example.com/')).to be true
      expect(entry.matches_url?('https://example.com/a')).to be false
    end

    it 'matches exact host when return URL includes query params' do
      entry.url = 'https://example.com'

      expect(entry.matches_url?('https://example.com?status=ASSESSMENT_STATUS')).to be true
      expect(entry.matches_url?('https://example.com/?status=ASSESSMENT_STATUS')).to be true
    end

    it 'matches optional path for wildcard path entries' do
      entry.url = 'https://example.com/*'

      expect(entry.matches_url?('https://example.com')).to be true
      expect(entry.matches_url?('https://example.com/')).to be true
      expect(entry.matches_url?('https://example.com/a')).to be true
      expect(entry.matches_url?('https://example.com/a/b')).to be true
      expect(entry.matches_url?('https://example.com?status=ASSESSMENT_STATUS')).to be true
      expect(entry.matches_url?('https://example.com/a?status=ASSESSMENT_STATUS')).to be true
      expect(entry.matches_url?('https://api.example.com/v1')).to be false
    end

    it 'matches wildcard subdomain entries' do
      entry.url = 'https://*.example.com/*'

      expect(entry.matches_url?('https://api.example.com/')).to be true
      expect(entry.matches_url?('https://api.example.com/v1')).to be true
      expect(entry.matches_url?('https://api.example.com/v1?status=ASSESSMENT_STATUS')).to be true
      expect(entry.matches_url?('https://foo.bar.example.com/x')).to be true
      expect(entry.matches_url?('https://foo.bar.example.com/x?status=ASSESSMENT_STATUS')).to be true
      expect(entry.matches_url?('https://example.com')).to be true
      expect(entry.matches_url?('https://example.com?status=ASSESSMENT_STATUS')).to be true
    end
  end

  describe 'after_commit callbacks' do
    describe '#sync_whitelisting_after_disable' do
      it 'delegates to setting#sync_url_whitelisting_enabled! when last enabled entry is disabled' do
        existing_entry = create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(url_whitelisting_enabled: true)

        existing_entry.update!(enabled: false)

        expect(setting.reload.url_whitelisting_enabled).to be false
      end

      it 'does not alter the setting when another enabled entry still remains' do
        first_entry = create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(url_whitelisting_enabled: true)

        first_entry.update!(enabled: false)

        expect(setting.reload.url_whitelisting_enabled).to be true
      end

      it 'does not call sync_url_whitelisting_enabled! when entry was not toggled true→false' do
        existing_entry = create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: false
        )
        setting.update_column(:url_whitelisting_enabled, false)

        expect(setting).not_to receive(:sync_url_whitelisting_enabled!)
        existing_entry.update!(url: 'https://example.com/other')
      end
    end

    describe '#sync_whitelisting_after_destroy' do
      it 'delegates to setting#sync_url_whitelisting_enabled! when last enabled entry is destroyed' do
        existing_entry = create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(url_whitelisting_enabled: true)

        existing_entry.destroy!

        expect(setting.reload.url_whitelisting_enabled).to be false
      end

      it 'does not alter the setting when the destroyed entry was disabled' do
        create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        disabled_entry = create(
          :application_url_whitelist_entry,
          application_setting: setting,
          enabled: false
        )
        setting.update!(url_whitelisting_enabled: true)

        disabled_entry.destroy!

        expect(setting.reload.url_whitelisting_enabled).to be true
      end
    end
  end
end
