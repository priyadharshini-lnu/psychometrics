FactoryGirl.define do
  factory :campaign do
    project { create(:project) }
  end
end
