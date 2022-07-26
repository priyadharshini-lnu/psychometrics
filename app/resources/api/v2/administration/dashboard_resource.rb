# frozen_string_literal: true

class Api::V2::Administration::DashboardResource < Api::V2::Administration::BaseResource
  attributes :name, :enabled, :dataset_id, :report_id, :embed_token

  has_one :campaign

  ransack_filters %i[campaign_id_eq]

  def fetchable_fields
    return super if context[:embed_token]

    super - [:embed_token]
  end

  def embed_token
    PowerBi::GetEmbedToken.call!(dataset_id, report_id, { username: context[:user].email })
  end
end
