# frozen_string_literal: true

class GetPermissionsHash < BaseCommand
  private_attr_accessor :policy_class, :current_user, :record, :permission_names

  def initialize(policy_class, current_user, record, permission_names)
    @policy_class = policy_class
    @current_user = current_user
    @record       = record
    @permission_names = permission_names
  end

  def call
    policy = policy_class.new(current_user, record)
    permissions_hash = {}
    permission_names.each do |permission|
      if permission.is_a?(Array)
        permissions_hash[permission[0]] = policy.send("#{permission[1]}?")
      else
        permissions_hash[permission] = policy.send("#{permission}?")
      end
    end
    broadcast :ok, permissions_hash
  end
end
