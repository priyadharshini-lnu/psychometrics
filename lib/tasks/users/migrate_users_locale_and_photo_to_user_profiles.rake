# frozen_string_literal: true

namespace :users do
  task :migrate_users_locale_and_photo_to_user_profiles, [:user_id] => :environment do |_, args|
    User.includes(:user_profile).order(:id).where('id > ?', args[:user_id].to_i).find_each do |user|
      user.user_profile.update!(locale: user.locale)
      user.user_profile.update!(photo: user.photo)
      p "Migrated locale and photo from user to user_profile for User##{user.id}"
    rescue StandardError => e
      raise StandardError, "Migrating locale and photo for User #{user.id} halted with error '#{e.message}'"
    end
  end
end
