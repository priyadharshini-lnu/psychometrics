# frozen_string_literal: true

FactoryBot.define do
  factory :privacy_setting do
    mask_data_for_third_party_assessment { false }
    privacy_link_text { 'Privacy link' }
    privacy_link_url { 'https://www.privacy.cc.com' }
  end
end
