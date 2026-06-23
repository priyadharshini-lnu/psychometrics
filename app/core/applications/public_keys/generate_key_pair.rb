# frozen_string_literal: true

module Applications
  module PublicKeys
    class GenerateKeyPair < BaseCommand
      private_attr_reader :user_id, :description, :created_by_id

      RSA_KEY_SIZE = 2048

      def initialize(user_id:, description:, created_by_id:)
        @user_id = user_id
        @description = description
        @created_by_id = created_by_id
      end

      def call
        rsa_key = OpenSSL::PKey::RSA.generate(RSA_KEY_SIZE)

        application_public_key = ApplicationPublicKey.create!(
          user_id: user_id,
          public_key: rsa_key.public_key.to_pem,
          description: description,
          created_by_id: created_by_id
        )

        result = {
          private_key: rsa_key.to_pem,
          application_public_key: application_public_key
        }

        broadcast :ok, result
      end
    end
  end
end
