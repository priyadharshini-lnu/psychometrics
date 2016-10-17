module Assessments
  module Actions
    module Assessment
      extend Actions::Action

      action :update do |data, _current_user, assessment|
        assessment.update(data)
        nil
      end

      action :factors do |_data, _current_user, assessment|
        assessment.dimension.factors.includes(:sub_factors).map do |factor|
          Factors::WithSubFactorsSerializer.new(factor).to_hash
        end
      end

      action :norms do |_data, _current_user, assessment|
        assessment.norms.map do |norm|
          NormSerializer.new(norm).to_hash
        end
      end
    end
  end
end
