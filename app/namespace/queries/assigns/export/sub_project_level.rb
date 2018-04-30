module Queries
  module Assigns
    module Export
      class SubProjectLevel < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id, assessment_id)
          @relation.
            joining { original_assign.membership.user }.
            where.has { original_assign.membership.client_id.eq(client_id) }.
            where(assessment_id: assessment_id)
        end
      end
    end
  end
end
