# frozen_string_literal: true

FactoryBot.define do
  factory :reports_published_snapshot, class: 'Reports::PublishedSnapshot' do
    report
    data { {} }
    published_at { Time.current }
  end
end
