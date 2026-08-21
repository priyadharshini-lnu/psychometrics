# frozen_string_literal: true

module Api
  module V2
    module Administration
      class RecordChangeHistoryResource < Api::V2::Administration::BaseResource
        model_name 'ActiveRecordAudit'

        attributes :auditable_type, :auditable_id, :action, :audited_changes, :version, :created_at
      end
    end
  end
end
