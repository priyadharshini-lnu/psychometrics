# frozen_string_literal: true

module Api
  module V1
    module Projects
      class CreateForm < UpdateForm
        attribute :client_id, Integer

        validates :name, :subdomain, :client_id, presence: true
        validates :data_processing_consent, inclusion: [true, false]

        validate :client_exists

        def client_exists
          return if Client.exists?(id: client_id)

          errors.add(:client_id, "Client #{client_id} does not exist")
        end

        def uniq_subdomain
          return if subdomain.nil?
          return unless Client.exists?(subdomain: subdomain)

          errors.add(:subdomain, "Subdomain #{subdomain} is already taken")
        end
      end
    end
  end
end
