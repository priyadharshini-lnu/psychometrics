FactoryGirl.define do
  factory :participant do
    campaign
    evaluator { create(:user) }
  end
end
