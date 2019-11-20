# frozen_string_literal: true

FactoryGirl.define do
  factory :report_filter, class: 'Reports::Filter' do
    report
  end
end
