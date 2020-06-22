# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignSerializer < ActiveModel::Serializer
      attributes :id, :name, :type, :status

      has_many :assessments, serializer: AssessmentSerializer
      has_many :reports, serializer: ReportSerializer
    end
  end
end
