module Callbacks
  module Models
    module Assigns
      class UpdateCompletedAtByParent
        def after_commit(record)
          return unless record.completed_at_previously_changed? && record.original_assign.present?
          record.original_assign.update_columns(completed_at: record.completed_at)
        end
      end
    end
  end
end
