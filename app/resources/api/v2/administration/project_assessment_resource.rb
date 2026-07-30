# frozen_string_literal: true

class Api::V2::Administration::ProjectAssessmentResource < Api::V2::Administration::BaseResource
  attributes :assessment_id, :project_id, :normalize_factor_scores, :user_result_validity_in_days,
             :created_at, :updated_at, :assessment_type

  ransack_filters %i[filterable_fields]

  has_one :assessment, foreign_key_on: :related

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: lambda { |_, project_assessment|
    project_assessment.slice('id', 'assessment_id', 'project_id')
  }

  def self.sortable_fields(context)
    super + %i[assessment.name assessment.id]
  end

  def project_id
    @model.project_id.to_s
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def assessment_type
    Assessment::TYPES.key(@model.assessment.type)
  end

  def self.records(opts = {})
    Api::Administration::ProjectAssessmentPolicy::Scope.new(
      opts[:context][:user],
      ProjectAssessment,
      project_id: opts[:context][:project].id
    ).resolve.includes(assessment: :translations)
  end
end
