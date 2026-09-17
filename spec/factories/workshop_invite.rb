# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_invite do
    title { Faker::Lorem.word }
    description { Faker::Lorem.sentence }

    workshops { [create(:workshop)] }
    campaign { create(:campaign) }
    campaign_assessment_group { create(:campaign_assessment_group) }
  end
end
