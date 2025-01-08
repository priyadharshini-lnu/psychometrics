FactoryBot.define do
  factory :communication_email_resource do
    communication_email
    association :resource, factory: :user_idp_plan
  end
end
