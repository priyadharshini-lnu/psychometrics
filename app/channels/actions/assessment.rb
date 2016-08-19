module Actions
  module Assessment
    extend Actions::Action

    action :update do |data, _current_administrator, assessment|
      ::Assessment.update(assessment.id, data)
      nil
    end
  end
end
