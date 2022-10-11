# frozen_string_literal: true

namespace :one_time do
  task :create_user_profiles, %i[number] => %i[environment] do
    User.find_each do |user|
      user.create_user_profile(photo: user.photo)
      puts "User profile created for user with id #{user.id}"
    end
  end
end
