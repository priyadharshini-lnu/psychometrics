module Actions
  module Assessment
    extend Actions::Action

    action :update do |data, _current_administrator, assessment|
      assessment.update(data)
      nil
    end
  end
end
