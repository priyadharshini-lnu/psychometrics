# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PrivacySetting, type: :model do
  describe 'validations' do
    it 'allows url with http/https in url' do
      privacy_setting = build(:privacy_setting, privacy_link_url: 'http://cc.com')
      expect(privacy_setting.valid?).to eq(true)

      privacy_setting = build(:privacy_setting, privacy_link_url: 'https://cc.com')
      expect(privacy_setting.valid?).to eq(true)
    end

    it 'allows url with subdomain and http/https in url' do
      privacy_setting = build(:privacy_setting, privacy_link_url: 'http://subdomain.cc.com')
      expect(privacy_setting.valid?).to eq(true)

      privacy_setting = build(:privacy_setting, privacy_link_url: 'http://subdomain.cc.com')
      expect(privacy_setting.valid?).to eq(true)
    end
  end
end
