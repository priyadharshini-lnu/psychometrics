# frozen_string_literal: true

class GetPermissionsHash < BaseCommand
  private_attr_accessor :policy_class, :current_user, :record, :permissions

  def initialize(policy_class, current_user, record, permissions)
    @policy_class = policy_class
    @current_user = current_user
    @record       = record
    @permissions  = permissions
  end

  def call
    policy = policy_class.new(current_user, record)
    permissions_hash = {}
    permissions.each do |permission|
      permissions_hash[permission] = policy.send("#{permission}?")
    end
    broadcast :ok, permissions_hash
  end
end
