# frozen_string_literal: true

module Campaigns
  class AllAssessmentsQuery < Rectify::Query
    private_attr_reader :campaign, :search_query, :page, :page_size

    def initialize(campaign, search_query, page, page_size)
      @campaign = campaign
      @search_query = search_query
      @page = page || 1
      @page_size = page_size || 25
    end

    def query
      campaign_assessment_ids = campaign.campaign_assessments.pluck(:assessment_id)
      assessor_assessment_ids = campaign.campaign_assessor_assessments.pluck(:assessment_id)
      user_assessment_ids = campaign.user_assessments.distinct.pluck(:assessment_id)

      all_assessment_ids = (campaign_assessment_ids + assessor_assessment_ids + user_assessment_ids).uniq

      assessments = Assessment.where(id: all_assessment_ids)

      if search_query.present?
        assessments = assessments.filterable_fields(search_query)
      end

      assessments.page(page).per(page_size)
    end
  end
end
