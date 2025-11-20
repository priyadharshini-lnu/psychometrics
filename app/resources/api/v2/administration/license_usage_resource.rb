# frozen_string_literal: true

class Api::V2::Administration::LicenseUsageResource < Api::V2::Administration::BaseResource
  attributes :campaign_id, :created_at, :status_updated_at, :status_updated_by_id, :extras, :status

  has_one :campaign
  has_one :user
  has_one :status_updated_by

  ransack_filters %i[subject_name_or_subject_email_or_campaign_name_cont status_eq project_id_eq]

  before_create -> { @model.client_id = context[:client].id }

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, LicenseUsage]).where(
      license_id: opts[:context][:params]['license_id']
    )
  end
end
