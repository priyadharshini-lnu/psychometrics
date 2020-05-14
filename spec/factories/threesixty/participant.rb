# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_participant, class: 'Threesixty::Participant' do
    campaign
    evaluator { create(:user) }
    subject { create(:user) }

    trait :with_relationship do
      relationship
    end
  end
end
