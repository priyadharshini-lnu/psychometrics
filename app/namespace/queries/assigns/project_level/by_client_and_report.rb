# frozen_string_literal: true

module Queries
  module Assigns
    module ProjectLevel
      class ByClientAndReport < ::Queries::Base
        def initialize(relation = Assign.all)
          @relation = relation
        end

        def call(client_id, report_id)
          ByClient.new(@relation).call(client_id).
            joining { assigns_reports }.
            where.has { assigns_reports.report_id.eq(report_id) }
        end
      end
    end
  end
end
