# frozen_string_literal: true

class Api::V2::Administration::WorkshopResourceResource < Api::V2::Administration::BaseResource
  attributes :name, :url, :workshop_id

  has_one :workshop

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, workshop_resource) { workshop_resource.slice('id', 'name', 'url') }

  def self.records(opts = {})
    Api::Administration::WorkshopResourcePolicy::Scope.new(
      opts[:context][:user],
      WorkshopResource,
      campaign_id: opts[:context][:params]['campaign_id']
    ).resolve.where(workshop_id: opts[:context][:params]['workshop_id'])
  end
end
