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
  after_create :broadcast_create
  around_update :broadcast_update

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
    UserReportEvent.create!(
      user_report_id: context[:user_report].id,
      initiator_id: context[:user].id,
      event_type: 'comment_removed',
      details: {
        text: @model.text,
        module: @model.reports_module_id
      }
    )
    @model.soft_delete!(context[:user])
    :completed
  end

  def broadcast_create
    UserReportEvent.create!(
      user_report_id: context[:user_report].id,
      initiator_id: context[:user].id,
      event_type: 'comment_added',
      details: {
        text: @model.text,
        module: @model.reports_module_id
      }
    )
    Comments::Channel.broadcast_to context[:user_report], action: 'new_comment',
      comment: UserReportCommentSerializer.new.serialize(@model)
  end

  def broadcast_update
    old_text = @model.text
    old_resolved = @model.resolved
    yield if block_given?

    if old_resolved != @model.resolved
      UserReportEvent.create!(
        user_report_id: context[:user_report].id,
        initiator_id: context[:user].id,
        event_type: @model.resolved ? 'comment_resolved' : 'comment_unresolved',
        details: {
          module: @model.reports_module_id
        }
      )
    end

    if old_text != @model.text
      UserReportEvent.create!(
        user_report_id: context[:user_report].id,
        initiator_id: context[:user].id,
        event_type: 'comment_updated',
        details: {
          old_text: old_text,
          new_text: @model.text,
          module: @model.reports_module_id
        }
      )
    end

    Comments::Channel.broadcast_to context[:user_report], action: 'update_comment',
      comment: UserReportCommentSerializer.new.serialize(@model)
  end
end
