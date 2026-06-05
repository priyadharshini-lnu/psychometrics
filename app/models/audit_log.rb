# frozen_string_literal: true

class AuditLog < ApplicationRecord
  include RansackAssocSearchableFields
  include ::GeoFilterable

  serialize :payload, coder: JSON
  serialize :request, coder: JSON

  belongs_to :user, optional: true
  belongs_to :record, polymorphic: true, optional: true
  belongs_to :client
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign

  has_many :active_record_audits, foreign_key: 'request_uuid', primary_key: 'request_uuid'

  include Tenantable

  tenant_source :client, :user

  validates :action, presence: true

  enum :outcome, { failed: 0, successful: 1 }

  before_save :initialize_payload_request

  add_searchable_assoc_scope :client
  add_searchable_assoc_scope :project
  add_searchable_assoc_scope :campaign

  enum :interface, { :api => 0, :browser => 1 }

  scope :user_search, lambda { |search_term|
    table_alias = 'users'
    scope = joins(
      %(
        LEFT OUTER JOIN "users" "#{table_alias}" ON
        "#{table_alias}"."id" = "#{table_name}"."user_id"
      )
    )

    if (search_term !~ /\D/) && search_term.present?
      scope.where(
        %("#{table_name}"."user_id" = ? OR #{table_alias}.email ILIKE ?),
        search_term,
        "%#{search_term}%"
      )
    else
      scope.where("#{table_alias}.email ILIKE ?", "%#{search_term}%")
    end
  }

  def initialize_payload_request
    self.payload = {} if payload.nil?
    self.request = {} if request.nil?
  end

  def action_name
    I18n.t("audit_log.action.#{action}", default: action)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id action record_id record_type created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[user client project campaign]
  end

  def self.ransackable_scopes(_auth_object = nil)
    # returns an array of whitelisted scopes that can be used by ransack gem
    %i[client_search project_search campaign_search user_search]
  end

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    scope = where.not(client_id: restricted_client_subquery)
    scope.or(where(client_id: nil))
  end
end
