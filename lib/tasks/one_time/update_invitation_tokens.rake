# frozen_string_literal: true

namespace :one_time do
  desc 'Re-hash all pending invitation tokens with the current Devise secret. ' \
       'Supports optional limit and offset: rake one_time:update_invitation_tokens[1000,2000]'
  task :update_invitation_tokens, %i[limit offset] => :environment do |_, args|
    limit = args[:limit]&.to_i
    offset = args[:offset].to_i
    failed_user_ids = []

    pending_invitations = User.where.not(invitation_token: nil).
                          where(invitation_accepted_at: nil).
                          where.not(encrypted_invitation_raw: nil).
                          order(invitation_sent_at: :desc)
    pending_invitations = pending_invitations.offset(offset)
    pending_invitations = pending_invitations.limit(limit) if limit

    pending_invitations.find_in_batches(batch_size: 100) do |batch|
      users_to_update = []
      batch.each do |user|
        raw_token = Rails.application.message_verifier(
          Settings.secrets.secret_token_for_generate
        ).verify(user.encrypted_invitation_raw)
        new_hashed_token = Devise.token_generator.digest(User, :invitation_token, raw_token)
        user.invitation_token = new_hashed_token
        users_to_update << user
      rescue StandardError => e
        puts "Could not update user #{user.id}: #{e.message}"
        failed_user_ids << user.id
      end

      unless users_to_update.empty?
        User.import users_to_update, on_duplicate_key_update: [:invitation_token], validate: false
        puts "===========Batch completed. Last user in batch: #{users_to_update.last.id} ============"
      end
    end

    puts 'Done updating invitation tokens.'
    unless failed_user_ids.empty?
      puts "Failed user IDs: #{failed_user_ids.inspect}"
    end
  end
end
