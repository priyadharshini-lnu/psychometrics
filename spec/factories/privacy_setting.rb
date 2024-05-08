# frozen_string_literal: true

FactoryBot.define do
  factory :privacy_setting do
    privacy_link_text { 'Privacy link' }
    privacy_link_url { 'https://www.privacy.cc.com' }
  end
end
