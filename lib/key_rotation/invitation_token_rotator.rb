# frozen_string_literal: true

module KeyRotation
  # Re-signs User#encrypted_invitation_raw and re-hashes invitation_token
  # from a previous SECRET_TOKEN_FOR_GENERATE to the new one.
  #
  # Usage:
  #   KeyRotation::InvitationTokenRotator.call(
  #     prev_secret: ENV['PREV_SECRET_TOKEN_FOR_GENERATE'],
  #     new_secret:  Settings.secrets.secret_token_for_generate.to_s,
  #     scope:       User.where(...),
  #     failed:      failed_user_ids,
  #     skipped:     skipped_user_ids
  #   )
  class InvitationTokenRotator
    def self.call(options)
      new(options).call
    end

    def initialize(options)
      @prev_secret = options.fetch(:prev_secret)
      @new_secret  = options.fetch(:new_secret)
      @scope       = options.fetch(:scope)
      @failed      = options.fetch(:failed)
      @skipped     = options.fetch(:skipped)
    end

    def call
      old_verifier = Rails.application.message_verifier(@prev_secret)
      new_verifier = Rails.application.message_verifier(@new_secret)

      @scope.find_in_batches(batch_size: 100) do |batch|
        users_to_update = []

        batch.each do |user|
          raw_token = begin
            old_verifier.verify(user.encrypted_invitation_raw)
          rescue ActiveSupport::MessageVerifier::InvalidSignature
            @skipped << user.id
            next
          end

          user.encrypted_invitation_raw = new_verifier.generate(raw_token)
          user.invitation_token         = Devise.token_generator.digest(User, :invitation_token, raw_token)
          users_to_update << user
        rescue StandardError => e
          puts "  User #{user.id} failed: #{e.message}" # rubocop:disable Rails/Output
          @failed << user.id
        end

        unless users_to_update.empty?
          User.import users_to_update,
                      on_duplicate_key_update: %i[encrypted_invitation_raw invitation_token],
                      validate: false
          puts "  Batch done. Last user ID: #{users_to_update.last.id}" # rubocop:disable Rails/Output
        end
      end
    end
  end
end
