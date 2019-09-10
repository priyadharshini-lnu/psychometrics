# frozen_string_literal: true

module Callbacks
  module Models
    module Reports
      class CreateFactorsAliases
        def after_create(report)
          report.factors_through_factors_aliases << Factor.where(dimension_id: report.dimension_ids)
        end
      end
    end
  end
end
