# frozen_string_literal: true

FactoryBot.define do
  factory :communications_user do
    user
    communication
  end
end
