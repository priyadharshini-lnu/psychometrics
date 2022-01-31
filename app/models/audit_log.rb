# frozen_string_literal: true

class AuditLog < ApplicationRecord
  serialize :payload, JSON
  serialize :request, JSON

  belongs_to :user, required: false
  belongs_to :record, polymorphic: true, required: false
  belongs_to :client
  belongs_to :project
  belongs_to :campaign
  belongs_to :user

  validates :action, presence: true

  after_initialize :initialize_payload_request

  def initialize_payload_request
    self.payload = {} if payload.nil?
    self.request = {} if request.nil?
  end

  def action_name
    I18n.t("audit_log.action.#{action}", default: action)
  end
end
