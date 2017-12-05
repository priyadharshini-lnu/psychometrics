module Callbacks
  module Models
    module Assigns
      class UpdateResultByParent
        def after_commit(record)
          return unless record.status_previously_changed? && record.original_assign.present?
          record.original_assign.update_columns(status: record.status)
        end
      end
    end
  end
end
