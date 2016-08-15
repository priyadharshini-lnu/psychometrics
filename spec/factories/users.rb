FactoryGirl.define do
  factory :user do
    email 'test@test.com'
    password 'password'
    role :superadmin
    first_name 'test'
    last_name 'test'
  end
end
