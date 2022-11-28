# frozen_string_literal: true

class Api::V2::Administration::UserReportCommentResource < Api::V2::Administration::BaseResource
  attributes :text, :resolved

  has_one :parent, class_name: 'UserReportComment'
  has_one :reports_module, class_name: 'Reports::Module'
  has_one :creator, class_name: 'User'
  has_many :replies

  ransack_filters %i[parent_id_null]

  before_create -> { @model.user_report = context[:user_report] }
  before_create -> { @model.creator = context[:user] }

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.slice(:text, :user_report_id) }

  def self.creatable_fields(context)
    super - %i[creator replies user_report]
  end

  def self.updatable_fields(context)
    super - %i[creator replies reports_module parent]
  end

  def self.records(opts)
    super.where(user_report_id: opts.dig(:context, :user_report).id)
  end

  def remove
    @model.soft_delete!(context[:user])
    :completed
  end
end
