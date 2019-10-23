# frozen_string_literal: true

module Administration
  module Clients
    module Assessments
      class GenerateUniversalLink < Rectify::Command
        attr_reader :client, :assessment

        def initialize(client, assessment)
          @client = client
          @assessment = assessment
        end

        def call
          return broadcast(:invalid) if assessment.external?

          client.assessments_clients.find_by(assessment_id: assessment.id).generate_universal_link!
        end
      end
    end
  end
end
