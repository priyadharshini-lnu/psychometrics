module Actions
  module Assessment
    extend Actions::Action

    action :update do |data, _current_administrator, assessment|
      assessment.update(data)
      nil
    end

    action :factors do |_data, _current_administrator, assessment|
      result    = assessment.dimension.factors.map do |factor|
        FactorSerializer.new(factor, assessment).to_hash
      end
      result
    end
  end
end
