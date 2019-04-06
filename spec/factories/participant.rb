FactoryGirl.define do
  factory :participant do
    campaign
    evaluator { create(:campaigns_user) }
  end
end
