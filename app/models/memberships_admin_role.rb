# frozen_string_literal: true

class MembershipsAdminRole < ApplicationRecord
  audited

  belongs_to :membership
  belongs_to :admin_role

  include Tenantable

  tenant_source :membership

  include SecurityContextLoggable

  before_destroy :capture_security_context_data
  after_commit :log_security_context_change, on: %i[create destroy]

  attr_accessor :context_target_user, :context_client_id

  def log_security_context_change
    target = membership&.user || context_target_user
    client_id = membership&.client_id || context_client_id

    return unless target && client_id

    log_security_context_event(
      target_user: target,
      msg: "Admin Role '#{role_description}' #{security_action} for client #{client_id}"
    )
  end

  private

  def role_description
    admin_role&.name || (admin_role_id.present? ? "AdminRole:#{admin_role_id}" : 'Unknown AdminRole')
  end

  def security_action
    destroyed? ? 'removed' : 'assigned'
  end

  def capture_security_context_data
    self.context_target_user = membership&.user
    self.context_client_id = membership&.client_id
  end
end
