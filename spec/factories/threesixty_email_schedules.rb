FactoryGirl.define do
  factory :threesixty_email_schedule, class: 'Threesixty::EmailSchedule' do
    name "MyString"
    from "MyString"
    reply_to_email "MyString"
    content "MyText"
    scheduled_date "2019-06-20 17:27:19"
    sender_requirement ""
    delivered_at "2019-06-20 17:27:19"
  end
end
