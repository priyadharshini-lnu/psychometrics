module Assessments
  module Actions
    module Trash
      extend Actions::Action

      action :empty do |_data, _current_administrator, assessment|
        assessment.blocks.deleted.delete_all
        assessment.questions.deleted.delete_all
        nil
      end

    end
  end
end
