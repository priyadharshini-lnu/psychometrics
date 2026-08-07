# frozen_string_literal: true

# Re-signs User#encrypted_invitation_raw and re-hashes invitation_token
# from the previous SECRET_TOKEN_FOR_GENERATE to the new one.
#
# Setup in Heroku before running:
#   1. PREV_SECRET_TOKEN_FOR_GENERATE = current SECRET_TOKEN_FOR_GENERATE value  (old key)
#   2. SECRET_TOKEN_FOR_GENERATE      = SecureRandom.hex(64)                     (new key)
#
# IMPORTANT — rotation order dependency
# ----------------------------------------
# encrypted_invitation_raw is derived from BOTH:
#   secret_key_base (root)  +  SECRET_TOKEN_FOR_GENERATE (salt)
#
# The old_verifier is built via Rails.application.message_verifier
# which always uses the CURRENT SECRET_KEY_BASE as root.
#
# Therefore:
#   - Rotate SECRET_TOKEN_FOR_GENERATE FIRST (run this rake task)
#   - Rotate SECRET_KEY_BASE SECOND
#
# If you rotate SECRET_KEY_BASE first, this task will fail to verify any
# existing encrypted_invitation_raw and skip all users as unrecoverable.
#
# Usage:
#   bundle exec rake key_rotation:rotate_secret_token_for_generate
#   bundle exec rake "key_rotation:rotate_secret_token_for_generate[1000,0]"  # with limit/offset

namespace :key_rotation do
  desc 'Re-sign invitation tokens. Requires PREV_SECRET_TOKEN_FOR_GENERATE env var.'
  task :rotate_secret_token_for_generate, %i[limit offset] => :environment do |_, args|
    prev_secret = ENV.fetch('PREV_SECRET_TOKEN_FOR_GENERATE', nil)
    abort 'ERROR: PREV_SECRET_TOKEN_FOR_GENERATE env var must be set to the previous key value.' if prev_secret.blank?

    new_secret = Settings.secrets.secret_token_for_generate.to_s
    abort 'ERROR: SECRET_TOKEN_FOR_GENERATE is not configured.' if new_secret.blank?

    limit  = args[:limit]&.to_i
    offset = args[:offset].to_i

    failed_user_ids  = []
    skipped_user_ids = []

    pending_invitations = User.where.not(invitation_token: nil).
                          where(invitation_accepted_at: nil).
                          where.not(encrypted_invitation_raw: nil).
                          order(invitation_sent_at: :desc).
                          offset(offset)
    pending_invitations = pending_invitations.limit(limit) if limit

    puts "\n== Rotating SECRET_TOKEN_FOR_GENERATE for pending invitation tokens =="
    puts "Scope: #{pending_invitations.count} users (limit=#{limit || 'none'}, offset=#{offset})"

    KeyRotation::InvitationTokenRotator.call(
      prev_secret: prev_secret,
      new_secret:  new_secret,
      scope:       pending_invitations,
      failed:      failed_user_ids,
      skipped:     skipped_user_ids
    )

    unless skipped_user_ids.empty?
      puts "\nSkipped #{skipped_user_ids.size} user(s) — token signed with an older secret not in env (unrecoverable):"
      puts 'Verify in production: User.where(id: skipped_user_ids).all? { |u| u.encrypted_invitation_raw.nil? }'
    end

    if failed_user_ids.empty?
      puts "\nAll re-signable invitation tokens re-signed successfully."
    else
      puts "\nFailed user IDs (#{failed_user_ids.size}): #{failed_user_ids.inspect}"
      puts 'Re-run the task for those users or investigate individually.'
      exit 1
    end
  end
end
