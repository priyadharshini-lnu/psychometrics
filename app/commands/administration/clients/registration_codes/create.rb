# frozen_string_literal: true

module Administration
  module Clients
    module RegistrationCodes
      class Create < BaseCommand
        private_attr_reader :form, :client

        def initialize(form, client)
          @form = form
          @client = client
        end

        def call
          registration_code = client.registration_codes.create!(
            @form.attributes.merge(project_id: client.project.id)
          )

          broadcast(:ok, registration_code)
        end
      end
    end
  end
end
