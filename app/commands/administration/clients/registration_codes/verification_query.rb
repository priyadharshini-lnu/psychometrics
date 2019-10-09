# frozen_string_literal: true

module Administration
  module Clients
    module RegistrationCodes
      class VerificationQuery < Rectify::Query
        private_attr_reader :project, :registration_code

        def initialize(project, registration_code)
          @project = project
          @registration_code = registration_code
        end

        def query
          project.
            project_registration_codes.where(code: registration_code, disabled: false).
            where('start_date <= :now AND end_date >= :now AND total_count > use_count', now: Time.now)
        end
      end
    end
  end
end
