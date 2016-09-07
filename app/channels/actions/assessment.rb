module Actions
  module Assessment
    extend Actions::Action

    action :update do |data, _current_administrator, assessment|
      assessment.update(data)
      nil
    end

    action :factors do |_data, _current_administrator, assessment|
      assessment.dimension.factors.includes(:sub_factors).map do |factor|
        FactorSerializer.new(factor).to_hash
      end
    end
  end
end
