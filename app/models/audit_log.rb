# frozen_string_literal: true

class AuditLog < ApplicationRecord
  include RansackAssocSearchableFields
  serialize :payload, JSON
  serialize :request, JSON

  belongs_to :user, optional: true
  belongs_to :record, polymorphic: true, optional: true
  belongs_to :client
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign

  validates :action, presence: true

  after_initialize :initialize_payload_request

  add_searchable_assoc_scope :client
  add_searchable_assoc_scope :project
  add_searchable_assoc_scope :campaign

  def initialize_payload_request
    self.payload = {} if payload.nil?
    self.request = {} if request.nil?
  end

  def action_name
    I18n.t("audit_log.action.#{action}", default: action)
  end

  def self.ransackable_scopes(_auth_object = nil)
    # returns an array of whitelisted scopes that can be used by ransack gem
    %i[client_search project_search campaign_search]
  end
end
