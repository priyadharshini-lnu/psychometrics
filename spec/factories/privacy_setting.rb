# frozen_string_literal: true

FactoryBot.define do
  factory :privacy_setting do
    privacy_link_text { 'Privacy link' }
    privacy_link_url { 'https://www.privacy.cc.com' }
    allow_video_call_recording { true }
    video_call_recording_expiry_in_seconds { 3600 }
  end
end
