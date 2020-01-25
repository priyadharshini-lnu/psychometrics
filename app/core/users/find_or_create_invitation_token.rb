# frozen_string_literal: true

module Users
  class FindOrCreateInvitationToken < BaseCommand
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      if user.encrypted_invitation_raw.nil?
        user.skip_invitation = true
        user.send(:generate_invitation_token!)
        user.update_column(:invitation_sent_at, ::DateTime.current)
      end
      token = Rails.application.message_verifier(
        Rails.application.secrets.secret_token_for_generate
      ).verify(user.encrypted_invitation_raw)
      broadcast :ok, token
    end
  end
end
