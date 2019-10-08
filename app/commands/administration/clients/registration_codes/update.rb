# frozen_string_literal: true

module Administration
  module Clients
    module RegistrationCodes
      class Update < BaseCommand
        private_attr_reader :form, :registration_code

        def initialize(form, registration_code)
          @form = form
          @registration_code = registration_code
        end

        def call
          @registration_code.update!(@form.attributes)

          broadcast(:ok, @registration_code)
        end
      end
    end
  end
end
