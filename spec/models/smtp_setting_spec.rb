# frozen_string_literal: true

require 'rails_helper'

describe SmtpSetting, type: :model do
  describe 'from_name_and_email' do
    it 'returns default from name and email if smtp_setting is disabled' do
      allow(Branding).to receive(:display_name).and_return('Marsh')
      smtp_setting = build(:smtp_setting, enabled: false, from_name: 'James', from_email: 'james@cc.com')

      expect(smtp_setting.from_name_and_email).to eq('Marsh <no-reply@localhost>')
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

  describe 'admin_sender_from' do
    it 'returns default from name and no-reply email if smtp_setting is disabled' do
      allow(Branding).to receive(:display_name).and_return('Marsh')
      smtp_setting = build(:smtp_setting, enabled: false, from_name: 'James')

      expect(smtp_setting.admin_sender_from).to eq('Marsh <no-reply@localhost>')
    end

    it 'returns from_name and from_email if enabled' do
      smtp_setting = build(:smtp_setting, enabled: true, from_name: 'Admin Custom', from_email: 'custom@cc.com')

      expect(smtp_setting.admin_sender_from).to eq('Admin Custom <custom@cc.com>')
    end
  end

  describe 'a display name containing a comma' do
    it 'keeps the branded sender one address whose envelope-from is the real mailbox' do
      allow(Branding).to receive(:display_name).and_return('Mercer, a Marsh business')
      smtp_setting = build(:smtp_setting, enabled: false)

      message = Mail.new(from: smtp_setting.from_name_and_email, to: 'user@cc.com')

      expect(message.from_addrs).to eq(['no-reply@localhost'])
      expect(message.smtp_envelope_from).to eq('no-reply@localhost')
    end

    it 'keeps a client from_name one address whose envelope-from is the real mailbox' do
      smtp_setting = build(:smtp_setting, enabled: true, from_name: 'Acme, Inc.', from_email: 'hello@acme.com')

      message = Mail.new(from: smtp_setting.admin_sender_from, to: 'user@cc.com')

      expect(message.from_addrs).to eq(['hello@acme.com'])
      expect(message.smtp_envelope_from).to eq('hello@acme.com')
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

  describe '#clear_smtp_credentials_if_needed' do
    it 'clears sensitive SMTP credentials when use_sender_verification is true' do
      smtp_setting = create(:smtp_setting,
                            project: create(:project),
                            host: 'mail.example.com',
                            port: 587,
                            user_name: 'user',
                            password: 'password',
                            encryption: 'tls',
                            authentication_type: 'plain',
                            use_sender_verification: false)

      smtp_setting.update!(use_sender_verification: true)

      expect(smtp_setting.host).to be_nil
      expect(smtp_setting.port).to be_nil
      expect(smtp_setting.user_name).to be_nil
      expect(smtp_setting.password).to be_nil
      expect(smtp_setting.encryption).to eq('none')
      expect(smtp_setting.authentication_type).to eq('plain')
    end

    it 'retains credentials when use_sender_verification is false' do
      smtp_setting = create(:smtp_setting,
                            project: create(:project),
                            host: 'mail.example.com',
                            port: 587,
                            user_name: 'user',
                            password: 'password',
                            encryption: 'tls',
                            authentication_type: 'plain',
                            use_sender_verification: false)

      smtp_setting.update!(from_name: 'New Name')

      expect(smtp_setting.host).to eq('mail.example.com')
      expect(smtp_setting.port).to eq(587)
      expect(smtp_setting.password).to eq('password')
      expect(smtp_setting.encryption).to eq('tls')
    end
  end
end
