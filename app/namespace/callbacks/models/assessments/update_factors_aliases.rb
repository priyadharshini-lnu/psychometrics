module Callbacks
  module Models
    module Assessments
      class UpdateFactorsAliases
        def before_update(assessment)
          return if dimension_not_changed?(assessment)
          previous_dimension_id, current_dimension_id = assessment.changes['dimension_id']
          assessment.reports.find_each do |report|
            if report.single_dimension?(previous_dimension_id)
              report.destroy_dimension_aliases(Dimension.find(previous_dimension_id))
            end
            if report.dimension_ids.exclude?(current_dimension_id)
              report.factors_through_factors_aliases << Factor.where(dimension_id: current_dimension_id)
            end
          end
        end

        private

        def dimension_not_changed?(assessment)
          assessment.changes['dimension_id'].nil?
        end
      end
    end
  end
end
