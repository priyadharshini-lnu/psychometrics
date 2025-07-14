# frozen_string_literal: true

class Api::V2::Administration::CampaignReportResource < Api::V2::Administration::BaseResource
  attributes :available_languages, :default_language

  has_one :report
end
