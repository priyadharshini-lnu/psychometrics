# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    project { create(:project) }
  end
end
