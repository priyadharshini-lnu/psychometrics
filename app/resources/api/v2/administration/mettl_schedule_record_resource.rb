# frozen_string_literal: true

class Api::V2::Administration::MettlScheduleRecordResource < Api::V2::Administration::BaseResource
  attributes :id, :schedule_id, :schedule_name, :created_at

  ransack_filters %i[schedule_id schedule_name filterable_fields]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'

  def self.records(opts = {})
    super(opts).where(project_id: opts[:context][:project].id).parent_schedules
  end

  def created_at
    I18n.l @model.created_at, format: :short
  end
end
