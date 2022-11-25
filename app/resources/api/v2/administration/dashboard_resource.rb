# frozen_string_literal: true

class Api::V2::Administration::DashboardResource < Api::V2::Administration::BaseResource
  attributes :name, :enabled, :dataset_id, :report_id, :embed_token, :image_url, :image_name, :refresh_interval

  has_one :campaign

  ransack_filters %i[campaign_id_eq preview_available]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'

  def fetchable_fields
    return super if context[:embed_token]

    super - [:embed_token]
  end

  def embed_token
    PowerBi::GetEmbedToken.call!(dataset_id, report_id, { username: context[:user].email })
  end

  def image_url
    @model.image&.url
  end

  def image_name
    @model.read_attribute(:image)
  end
end
