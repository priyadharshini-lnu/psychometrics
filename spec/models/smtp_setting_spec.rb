# frozen_string_literal: true

require 'rails_helper'

describe SmtpSetting, type: :model do
  describe 'from_name_and_email' do
    it 'returns default from name and email if smtp_setting is disabled' do
      smtp_setting = build(:smtp_setting, enabled: false, from_name: 'James', from_email: 'james@cc.com')

      expect(smtp_setting.from_name_and_email).to eq('The Talent Enterprise <no-reply@localhost>')
    end

    it 'returns from_name from smtp_setting if enabled' do
      smtp_setting = build(:smtp_setting, enabled: true, from_name: 'James', from_email: nil)

      expect(smtp_setting.from_name_and_email).to eq('James <no-reply@localhost>')
    end

    it 'returns from_name and email from the smtp_setting if enabeld and both present' do
      smtp_setting = build(:smtp_setting, enabled: true, from_name: 'James', from_email: 'james@cc.com')

      expect(smtp_setting.from_name_and_email).to eq('James <james@cc.com>')
    end
  end

  describe 'settings_for_email' do
    it 'returns nil if smtp_setting is not enabled' do
      smtp_setting = build(:smtp_setting, enabled: false)

      expect(smtp_setting.settings_for_email).to eq(nil)
    end

    it "returns nil if smtp_setting doesn't have a host" do
      smtp_setting = build(:smtp_setting, enabled: true, host: nil)

      expect(smtp_setting.settings_for_email).to eq(nil)
    end

    it 'returns smtp_setting attributes required for sending email' do
      smtp_setting = build(:smtp_setting, encryption: :none)

      expect(smtp_setting.settings_for_email).to eq({
        address: smtp_setting.host,
        port: smtp_setting.port,
        user_name: smtp_setting.user_name,
        password: smtp_setting.password,
        authentication: smtp_setting.authentication_type
      })
    end

    it 'sets ssl to true if encryption type is ssl' do
      smtp_setting = build(:smtp_setting, encryption: :ssl)

      expect(smtp_setting.settings_for_email).to eq({
        address: smtp_setting.host,
        port: smtp_setting.port,
        user_name: smtp_setting.user_name,
        password: smtp_setting.password,
        authentication: smtp_setting.authentication_type,
        ssl: true
      })
    end

    it 'sets tls to true if encryption type is tls' do
      smtp_setting = build(:smtp_setting, encryption: :tls)

      expect(smtp_setting.settings_for_email).to eq({
        address: smtp_setting.host,
        port: smtp_setting.port,
        user_name: smtp_setting.user_name,
        password: smtp_setting.password,
        authentication: smtp_setting.authentication_type,
        tls: true
      })
    end
  end
end
