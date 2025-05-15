# frozen_string_literal: true

class Api::V2::Administration::MettlScheduleRecordResource < Api::V2::Administration::BaseResource
  attributes :schedule_id, :schedule_name, :created_at, :assessment_id, :assessment_name,
             :secure_browser_enabled, :visual_proctoring_settings, :web_proctoring_settings

  has_one :assessment

  ransack_filters %i[schedule_id schedule_name assessment_id_eq filterable_fields]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'

  def self.records(opts = {})
    super.where(project_id: opts[:context][:project].id).parent_schedules
  end

  def created_at
    I18n.l @model.created_at, format: :short
  end

  def assessment_name
    @model.assessment.name
  end

  def self.sortable_fields(context)
    super + %i[assessment.name]
  end
end
