# frozen_string_literal: true

class Api::V2::Administration::YoodliAssessmentResource < Api::V2::Administration::BaseResource
  attributes :name, :product_id, :project_id, :created_at, :updated_at

  ransack_filters %i[name product_id filterable_fields]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: '*'

  before_create do
    @model.project_id = context[:project].id
  end

  def self.records(opts = {})
    super.where(project_id: opts[:context][:project].id)
  end

  def created_at
    I18n.l @model.created_at, format: :short
  end

  def updated_at
    I18n.l @model.updated_at, format: :short
  end

  def self.sortable_fields(context)
    super + %i[id name product_id]
  end
end
