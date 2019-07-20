FactoryGirl.define do
  factory :participant do
    campaign
    evaluator { create(:user) }
    subject { create(:user) }
  end
end
