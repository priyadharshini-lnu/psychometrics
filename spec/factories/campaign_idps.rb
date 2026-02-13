# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_idp do
    automatically_assign_new { false }
    campaign
    idp_template
  end

  factory :campaign_idp_dependency do
    campaign_idp
    association :dependency, factory: :question
  end
end
