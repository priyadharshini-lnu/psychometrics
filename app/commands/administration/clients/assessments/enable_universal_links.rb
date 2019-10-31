# frozen_string_literal: true

module Administration
  module Clients
    module Assessments
      class EnableUniversalLinks < Rectify::Command
        attr_reader :client, :assessment

        def initialize(client, assessment)
          @client = client
          @assessment = assessment
        end

        def call
          return broadcast(:invalid) if assessment.external?

          assessment_client = client.assessments_clients.find_by(assessment_id: assessment.id)
          assessment_client.toggle_universal_links!(true)

          broadcast(:ok)
        end
      end
    end
  end
end
