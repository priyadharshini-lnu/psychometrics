module Callbacks
  module Models
    module Assigns
      class UpdateStartedAtByParent
        def after_commit(record)
          return unless record.started_at_previously_changed? && record.original_assign.present?
          record.original_assign.update_columns(started_at: record.started_at)
        end
      end
    end
  end
end
