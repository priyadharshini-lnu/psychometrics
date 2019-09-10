# frozen_string_literal: true

module Queries
  module Assigns
    module SubProjectLevel
      class ByClient < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id)
          @relation.
            joining { assessment }.
            joining { original_assign.membership.user }.
            where.has { original_assign.membership.client_id.eq(client_id) }
        end
      end
    end
  end
end
