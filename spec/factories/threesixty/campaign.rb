# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_campaign, class: 'Threesixty::Campaign' do
    campaign
    assessment { create(:assessment, category: 'threesixty') }
    report { create(:report, category: 'threesixty') }
  end
end
