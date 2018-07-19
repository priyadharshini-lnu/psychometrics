module Queries
  module Assigns
    module ProjectLevel
      class ByClient < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id)
          @relation.
            joining { membership.user }.
            joining { assessment }.
            where.has { membership.client_id.eq(client_id) }
        end
      end
    end
  end
end
