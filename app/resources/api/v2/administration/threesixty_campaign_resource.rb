# frozen_string_literal: true

class Api::V2::Administration::ThreesixtyCampaignResource < Api::V2::Administration::BaseResource
  attributes :assessment_id, :report_id, :name

  def self.creatable_fields(context)
    super + %i[threesixty_type campaign_template_id factors questions]
  end
end
