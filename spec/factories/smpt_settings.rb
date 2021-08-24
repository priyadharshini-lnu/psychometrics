FactoryBot.define do
  factory :smpt_setting do
    host { "MyString" }
    encryption { 1 }
    port { 1 }
    user_name { "MyString" }
    password { "MyString" }
    authentication_type { 1 }
  end
end
