module Assessments
  module Actions
    module Assessment
      extend Actions::Action

      action :update do |data, _current_user, assessment|
        assessment.update(data)
        nil
      end

      action :factors do |_data, _current_user, assessment|
        factors = assessment.dimension.factors.includes(:sub_factors).map do |factor|
          result = []
          result << Factors::WithoutSubFactorsSerializer.new(factor).to_hash
          factor.sub_factors.map do |sub_factor|
            result << Factors::WithoutSubFactorsSerializer.new(sub_factor).to_hash
          end
          result
        end
        factors.flatten
      end

      action :norms do |_data, _current_user, assessment|
        assessment.norms.map do |norm|
          NormSerializer.new(norm).to_hash
        end
      end
    end
  end
end
