# frozen_string_literal: true

class Api::V2::Administration::AdminRoleResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :permissions, :client_id

  ransack_filters %i[client_id_eq name_cont]

  before_save :set_client_id, on: %i[create update]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.slice(:id, :name) }

  def self.records(opts = {})
    client_id = opts[:context][:params]['client_id']

    ::Pundit.policy_scope!(
      opts[:context][:user],
      [:api, :administration, AdminRole]
    ).where(client_id: client_id)
  end

  private

  def set_client_id
    @model.client_id = context[:params]['client_id']
  end
end
