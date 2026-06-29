# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationSetting, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:application) { create(:application_user, tenant: tenant) }

  subject(:setting) do
    application.application_setting.tap { |s| s.update_column(:ip_whitelisting_enabled, false) }
  end

  describe '#ip_allowed?' do
    context 'when ip_whitelisting_enabled is false' do
      it 'allows any IP without checking entries' do
        expect(setting.ip_allowed?('1.2.3.4')).to be true
      end
    end

    context 'when ip_whitelisting_enabled is true' do
      context 'with no enabled entries' do
        before { setting.update_column(:ip_whitelisting_enabled, true) }

        it 'blocks all IPs' do
          expect(setting.ip_allowed?('1.2.3.4')).to be false
        end
      end

      context 'with an enabled matching IPv4 entry' do
        before do
          create(:application_ip_whitelist_entry, application_setting: setting, ip_or_cidr: '1.2.3.4')
          setting.update!(ip_whitelisting_enabled: true)
        end

        it 'allows the matching IP' do
          expect(setting.ip_allowed?('1.2.3.4')).to be true
        end

        it 'blocks a non-matching IP' do
          expect(setting.ip_allowed?('9.9.9.9')).to be false
        end
      end

      context 'with a CIDR range entry' do
        before do
          create(:application_ip_whitelist_entry, application_setting: setting, ip_or_cidr: '192.168.1.0/24')
          setting.update!(ip_whitelisting_enabled: true)
        end

        it 'allows an IP within the CIDR range' do
          expect(setting.ip_allowed?('192.168.1.50')).to be true
        end

        it 'blocks an IP outside the CIDR range' do
          expect(setting.ip_allowed?('192.168.2.1')).to be false
        end
      end

      context 'with a disabled entry' do
        before do
          create(:application_ip_whitelist_entry, application_setting: setting, ip_or_cidr: '1.2.3.4', enabled: false)
          setting.update_column(:ip_whitelisting_enabled, true)
        end

        it 'blocks the IP even though the entry exists' do
          expect(setting.ip_allowed?('1.2.3.4')).to be false
        end
      end

      context 'with an invalid IP address passed in' do
        before do
          create(:application_ip_whitelist_entry, application_setting: setting, ip_or_cidr: '1.2.3.4')
          setting.update!(ip_whitelisting_enabled: true)
        end

        it 'returns false without raising' do
          expect(setting.ip_allowed?('not-an-ip')).to be false
        end
      end
    end
  end

  describe '#sync_ip_whitelisting_enabled!' do
    context 'when ip_whitelisting_enabled is already false' do
      it 'is a no-op' do
        setting.update_column(:ip_whitelisting_enabled, false)

        expect { setting.sync_ip_whitelisting_enabled! }.
          not_to(change { setting.reload.ip_whitelisting_enabled })
      end
    end

    context 'when ip_whitelisting_enabled is true and enabled entries still exist' do
      before do
        create(:application_ip_whitelist_entry, application_setting: setting, enabled: true)
        setting.update_column(:ip_whitelisting_enabled, true)
      end

      it 'leaves ip_whitelisting_enabled true' do
        setting.sync_ip_whitelisting_enabled!

        expect(setting.reload.ip_whitelisting_enabled).to be true
      end
    end

    context 'when ip_whitelisting_enabled is true and no enabled entries remain' do
      before do
        create(:application_ip_whitelist_entry, application_setting: setting, enabled: false)
        setting.update_column(:ip_whitelisting_enabled, true)
      end

      it 'sets ip_whitelisting_enabled to false' do
        setting.sync_ip_whitelisting_enabled!

        expect(setting.reload.ip_whitelisting_enabled).to be false
      end

      it 'uses update_all so validate_ip_whitelists_if_enabled is not triggered' do
        expect(setting).not_to receive(:valid?)
        setting.sync_ip_whitelisting_enabled!
      end
    end
  end
end
