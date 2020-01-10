# frozen_string_literal: true

namespace :users do
  task downcase_email: :environment do
    User.find_each do |user|
      user.update(email: user.email.downcase) if user.email != user.email.downcase
    end
  end
end
