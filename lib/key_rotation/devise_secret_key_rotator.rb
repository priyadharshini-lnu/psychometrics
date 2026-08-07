# frozen_string_literal: true

module KeyRotation
  # Re-hashes User#invitation_token after DEVISE_SECRET_KEY is rotated.
  #
  # When DEVISE_SECRET_KEY changes, Devise's token_generator produces different
  # digests for the same raw token. This rotator re-hashes all pending
  # invitation_token values using the current (new) Devise.token_generator so
  # existing invitation links keep working.
  #
  # The raw token is recovered from encrypted_invitation_raw via
  # InvitationTokenVerifier — that column is signed by SECRET_TOKEN_FOR_GENERATE,
  # not DEVISE_SECRET_KEY, so it is unaffected by this rotation.
  #
  # Usage:
  #   KeyRotation::DeviseSecretKeyRotator.call(
  #     scope:  User.where(...),
  #     failed: failed_user_ids
  #   )
  class DeviseSecretKeyRotator
    def self.call(options)
      new(options).call
    end

    def initialize(options)
      @scope  = options.fetch(:scope)
      @failed = options.fetch(:failed)
    end

    def call
      @scope.find_in_batches(batch_size: 100) do |batch|
        users_to_update = []

        batch.each do |user|
          raw_token             = KeyRotation::InvitationTokenVerifier.verify(user.encrypted_invitation_raw)
          user.invitation_token = Devise.token_generator.digest(User, :invitation_token, raw_token)
          users_to_update << user
        rescue StandardError => e
          puts "  User #{user.id} failed: #{e.message}" # rubocop:disable Rails/Output
          @failed << user.id
        end

        unless users_to_update.empty?
          User.import users_to_update, on_duplicate_key_update: [:invitation_token], validate: false
          puts "  Batch done. Last user ID: #{users_to_update.last.id}" # rubocop:disable Rails/Output
        end
      end
    end
  end
end
