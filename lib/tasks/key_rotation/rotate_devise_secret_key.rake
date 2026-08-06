# frozen_string_literal: true

# Re-hashes User#invitation_token after DEVISE_SECRET_KEY is rotated.
#
# When DEVISE_SECRET_KEY changes, Devise's token_generator produces different
# digests for the same raw token. Pending invitation_token values in the DB
# must be re-hashed so existing invitation links keep working.
#
# encrypted_invitation_raw (signed by SECRET_TOKEN_FOR_GENERATE) is used to
# recover the raw token — it is unaffected by DEVISE_SECRET_KEY rotation.
#
# Setup in Heroku before running:
#   1. Update DEVISE_SECRET_KEY to the new value
#   2. Restart the app
#   3. Run this task
#
# No ordering dependency with other key rotations:
#   DEVISE_SECRET_KEY only affects Devise.token_generator.digest — it has no
#   effect on message_verifier or encrypted_invitation_raw. This task is safe
#   to run whenever DEVISE_SECRET_KEY is rotated, independently of other keys.
#
# Usage:
#   bundle exec rake key_rotation:rotate_devise_secret_key
#   bundle exec rake "key_rotation:rotate_devise_secret_key[1000,0]"  # with limit/offset

namespace :key_rotation do
  desc 'Re-hash pending invitation tokens after DEVISE_SECRET_KEY rotation. ' \
       'Supports optional limit and offset: rake "key_rotation:rotate_devise_secret_key[1000,0]"'
  task :rotate_devise_secret_key, %i[limit offset] => :environment do |_, args|
    limit  = args[:limit]&.to_i
    offset = args[:offset].to_i
    failed_user_ids = []

    pending_invitations = User.where.not(invitation_token: nil).
                          where(invitation_accepted_at: nil).
                          where.not(encrypted_invitation_raw: nil).
                          order(invitation_sent_at: :desc).
                          offset(offset)
    pending_invitations = pending_invitations.limit(limit) if limit

    puts "\n== Re-hashing invitation tokens with new DEVISE_SECRET_KEY =="
    puts "Scope: #{pending_invitations.count} users (limit=#{limit || 'none'}, offset=#{offset})"

    pending_invitations.find_in_batches(batch_size: 100) do |batch|
      users_to_update = []
      batch.each do |user|
        raw_token = Rails.application.message_verifier(
          Settings.secrets.secret_token_for_generate
        ).verify(user.encrypted_invitation_raw)
        user.invitation_token = Devise.token_generator.digest(User, :invitation_token, raw_token)
        users_to_update << user
      rescue StandardError => e
        puts "  User #{user.id} failed: #{e.message}"
        failed_user_ids << user.id
      end

      unless users_to_update.empty?
        User.import users_to_update, on_duplicate_key_update: [:invitation_token], validate: false
        puts "  Batch done. Last user ID: #{users_to_update.last.id}"
      end
    end

    puts "\nDone re-hashing invitation tokens."
    unless failed_user_ids.empty?
      puts "Failed user IDs: #{failed_user_ids.inspect}"
    end
  end
end
