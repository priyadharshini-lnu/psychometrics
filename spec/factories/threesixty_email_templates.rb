FactoryGirl.define do
  factory :threesixty_email_template, class: 'Threesixty::EmailTemplate' do
    category 1
    name "MyString"
    content "MyText"
    from "MyString"
    recipent "MyString"
    subject "MyText"
  end
end
