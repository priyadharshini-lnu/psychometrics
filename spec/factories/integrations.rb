# frozen_string_literal: true

FactoryBot.define do
  factory :integration do
    project
    name { Integration.names.keys.first }
  end
end
