# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_invite do
    title { Faker::Lorem.word }
    description { Faker::Lorem.sentence }

    workshops { [FactoryBot.create(:workshop)] }
  end
end
