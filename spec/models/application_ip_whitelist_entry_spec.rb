# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationIpWhitelistEntry, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:application) { create(:application_user, tenant: tenant) }
  let(:setting) { application.application_setting }

  subject(:entry) { build(:application_ip_whitelist_entry, application_setting: setting) }

  describe 'validations' do
    it { is_expected.to be_valid }

    it 'is invalid without ip_or_cidr' do
      entry.ip_or_cidr = nil
      expect(entry).not_to be_valid
      expect(entry.errors[:ip_or_cidr]).to be_present
    end

    it 'is invalid with a malformed IP' do
      entry.ip_or_cidr = 'not-an-ip'
      expect(entry).not_to be_valid
      expect(entry.errors[:ip_or_cidr]).to be_present
    end

    it 'is valid with a plain IPv4 address' do
      entry.ip_or_cidr = '10.0.0.1'
      expect(entry).to be_valid
    end

    it 'is valid with an IPv4 CIDR range' do
      entry.ip_or_cidr = '10.0.0.0/8'
      expect(entry).to be_valid
    end

    it 'is valid with a plain IPv6 address' do
      entry.ip_or_cidr = '::1'
      expect(entry).to be_valid
    end

    it 'is valid with an IPv6 CIDR range' do
      entry.ip_or_cidr = '2001:db8::/32'
      expect(entry).to be_valid
    end
  end

  describe '#matches_ip?' do
    before { entry.ip_or_cidr = '192.168.1.0/24' }

    it 'returns true for an IP within the CIDR range' do
      expect(entry.matches_ip?(IPAddr.new('192.168.1.10'))).to be true
    end

    it 'returns false for an IP outside the CIDR range' do
      expect(entry.matches_ip?(IPAddr.new('10.0.0.1'))).to be false
    end

    it 'returns false for a blank ip_address' do
      expect(entry.matches_ip?(nil)).to be false
    end
  end

  describe 'after_commit callbacks' do
    describe '#sync_whitelisting_after_disable' do
      it 'delegates to setting#sync_ip_whitelisting_enabled! when last enabled entry is disabled' do
        existing_entry = create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(ip_whitelisting_enabled: true)

        existing_entry.update!(enabled: false)

        expect(setting.reload.ip_whitelisting_enabled).to be false
      end

      it 'does not alter the setting when another enabled entry still remains' do
        first_entry = create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(ip_whitelisting_enabled: true)

        first_entry.update!(enabled: false)

        expect(setting.reload.ip_whitelisting_enabled).to be true
      end

      it 'does not call sync_ip_whitelisting_enabled! when entry was not toggled true→false' do
        existing_entry = create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: false
        )
        setting.update_column(:ip_whitelisting_enabled, false)

        expect(setting).not_to receive(:sync_ip_whitelisting_enabled!)
        existing_entry.update!(ip_or_cidr: '10.0.0.2')
      end
    end

    describe '#sync_whitelisting_after_destroy' do
      it 'delegates to setting#sync_ip_whitelisting_enabled! when last enabled entry is destroyed' do
        existing_entry = create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        setting.update!(ip_whitelisting_enabled: true)

        existing_entry.destroy!

        expect(setting.reload.ip_whitelisting_enabled).to be false
      end

      it 'does not alter the setting when the destroyed entry was disabled' do
        create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: true
        )
        disabled_entry = create(
          :application_ip_whitelist_entry,
          application_setting: setting,
          enabled: false
        )
        setting.update!(ip_whitelisting_enabled: true)

        disabled_entry.destroy!

        expect(setting.reload.ip_whitelisting_enabled).to be true
      end
    end
  end
end
