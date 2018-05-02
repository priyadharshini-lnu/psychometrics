module Queries
  module Assigns
    module ProjectLevel
      class ByClientAndAssessment < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id, assessment_id)
          ByClient.new(@relation).call(client_id).
            where(assessment_id: assessment_id)
        end
      end
    end
  end
end
