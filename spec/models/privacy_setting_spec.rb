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

    it 'has allow_video_call_recording default to false' do
      privacy_setting = PrivacySetting.new
      expect(privacy_setting.allow_video_call_recording).to eq(false)
    end

    it 'has enable_video_call_recording_for_all_new_campaigns default to false' do
      privacy_setting = PrivacySetting.new
      expect(privacy_setting.enable_video_call_recording_for_all_new_campaigns).to eq(false)
    end

    it 'allows setting video_call_recording_expiry_in_seconds' do
      privacy_setting = PrivacySetting.new(video_call_recording_expiry_in_seconds: 3600)
      expect(privacy_setting.video_call_recording_expiry_in_seconds).to eq(3600)
    end
  end
end
