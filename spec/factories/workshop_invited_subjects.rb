# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_invited_subject do
    workshop_invite
    user
    status { 'pending' }
  end
end
