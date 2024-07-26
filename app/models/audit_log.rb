# frozen_string_literal: true

class AuditLog < ApplicationRecord
  include RansackAssocSearchableFields

  serialize :payload, coder: JSON
  serialize :request, coder: JSON

  belongs_to :user, optional: true
  belongs_to :record, polymorphic: true, optional: true
  belongs_to :client
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign

  has_many :active_record_audits, foreign_key: 'request_uuid', primary_key: 'request_uuid'

  validates :action, presence: true

  enum outcome: { failed: 0, successful: 1 }

  before_save :initialize_payload_request

  add_searchable_assoc_scope :client
  add_searchable_assoc_scope :project
  add_searchable_assoc_scope :campaign

  enum :interface, %i[api browser]

  scope :user_search, lambda {  |search_term|
    if (search_term !~ /\D/) && search_term.present?
      where(
        'user_id = ? OR users.email ILIKE ?', search_term, "%#{search_term}%"
      )
    else
      where('users.email ILIKE ?', "%#{search_term}%")
    end
  }

  def initialize_payload_request
    self.payload = {} if payload.nil?
    self.request = {} if request.nil?
  end

  def action_name
    I18n.t("audit_log.action.#{action}", default: action)
  end

  def self.ransackable_scopes(_auth_object = nil)
    # returns an array of whitelisted scopes that can be used by ransack gem
    %i[client_search project_search campaign_search user_search]
  end
end
