# frozen_string_literal: true

module Api
  module V1
    class CampaignReportSerializer < Panko::Serializer
      attributes :id, :report_family_id, :user_access, :assessor_access
    end
  end
end
