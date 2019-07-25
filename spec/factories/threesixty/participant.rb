FactoryGirl.define do
  factory :threesixty_participant, class: 'Threesixty::Participant' do
    campaign
    evaluator { create(:user) }
  end
end
