# frozen_string_literal: true

class GetPermissionsHash < BaseCommand
  private_attr_accessor :policy_class, :current_user, :record,
                        :permission_names, :project_id, :campaign_id

  def initialize(policy_class, current_user, record, permission_names, ids = {})
    @policy_class = policy_class
    @current_user = current_user
    @record       = record
    @project_id   = ids[:project_id]
    @campaign_id  = ids[:campaign_id]
    @permission_names = permission_names
  end

  def call
    policy = policy_class.new(
      current_user, record, { project_id: project_id, campaign_id: campaign_id }
    )
    permissions_hash = {}
    permission_names.each do |permission|
      if permission.is_a?(Array)
        permission_name, policy_method_name = permission
        permissions_hash[permission_name] = policy.send(:"#{policy_method_name}?")
      else
        permissions_hash[permission] = policy.send(:"#{permission}?")
      end
    end
    broadcast :ok, permissions_hash
  end
end
