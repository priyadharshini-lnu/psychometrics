# frozen_string_literal: true

module Users
  class CreateAnonym < BaseCommand
    attr_reader :client

    def initialize(client)
      @client = client
    end

    def call
      # Generate uniq anonym user email
      uniq_anonym_email = loop do
        email = "Anonym#{Time.now.to_i}#{rand(10_000)}@example.com"
        break email unless User.exists?(email: email)
      end

      # Build anonym user with membership
      user = User.create(
        role: User::REGULAR_ROLE, is_anonym: true,
        first_name: 'Anonymous', last_name: 'User',
        email: uniq_anonym_email,
        password: uniq_anonym_email, password_confirmation: uniq_anonym_email,
        project: client.project,
        memberships_attributes: [{
          client_id: client.id
        }]
      )
      broadcast :ok, user
    end
  end
end
