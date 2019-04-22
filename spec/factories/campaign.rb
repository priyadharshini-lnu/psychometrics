FactoryGirl.define do
  factory :campaign do
    project { create(:project) }
    threesixty_campaign { build(:threesixty_campaign) }
  end
end
