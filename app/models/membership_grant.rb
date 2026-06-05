# frozen_string_literal: true

class MembershipGrant < ApplicationRecord
  audited

  belongs_to :membership

  include Tenantable

  tenant_source :membership

  include SecurityContextLoggable

  before_save :capture_security_updates
  before_destroy :capture_security_context_data
  after_commit :log_security_context_change, on: %i[create update destroy]

  attr_accessor :context_target_user, :context_client_id, :security_action

  def log_security_context_change
    return unless security_action

    target = membership&.user || context_target_user
    client_id = membership&.client_id || context_client_id

    return unless target && client_id

    log_security_context_event(
      target_user: target,
      msg: "Membership grants #{security_action} for client #{client_id}"
    )
  end

  def has_grant?(scope, grant)
    return false if data.nil?

    !!data[scope.to_s]&.index(grant.to_s)
  end

  private

  def capture_security_updates
    if new_record?
      self.security_action = 'assigned'
    elsif changes.key?('data')
      self.security_action = 'updated'
    end
  end

  def capture_security_context_data
    self.security_action = 'removed'
    self.context_target_user = membership&.user
    self.context_client_id = membership&.client_id
  end
end
