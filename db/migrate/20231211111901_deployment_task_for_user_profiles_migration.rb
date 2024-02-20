class DeploymentTaskForUserProfilesMigration < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add("Run this rake $ bundle exec rake 'users:migrate_users_locale_and_photo_to_user_profiles[OPTIONAL_USER_ID]' to migrate :locale and :photo from User to UserProfile")
  end
end
