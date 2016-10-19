module Assessments
  module Actions
    module Trash
      extend Actions::Action

      action :empty do |_data, _current_user, assessment|
        assessment.blocks.deleted.delete_all
        assessment.questions.deleted.delete_all
        nil
      end

    end
  end
end
