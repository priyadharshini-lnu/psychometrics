# frozen_string_literal: true

class Api::V2::Administration::DashboardResource < Api::V2::Administration::BaseResource
  attributes :name, :enabled, :dataset_id, :report_id

  has_one :campaign

  ransack_filters %i[campaign_id_eq]
end
