# frozen_string_literal: true

module Queries
  module Assigns
    module SubProjectLevel
      class ByClientAndReport < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id, report_id)
          @relation.
            joining { original_assign.membership.user }.
            joining do
            assigns_reports.on do |ar|
              (ar.assign_id.eq(id) | ar.assign_id.eq(original_assign.id)) & ar.report_id.eq(report_id)
            end
          end .
            where.has { original_assign.membership.client_id.eq(client_id) }
        end
      end
    end
  end
end
