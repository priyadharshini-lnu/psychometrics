# frozen_string_literal: true

module UserAssessments
  class OrderedAssessments < BaseCommand
    private_attr_reader :user, :campaign_id

    def initialize(user, campaign_id = nil)
      @user = user
      @campaign_id = campaign_id
    end

    def call
      ordered_user_assessments = campaigns.each_with_object([]) do |campaign, acc|
        acc.concat(campaign_ordered_user_assessments(campaign))
      end

      broadcast :ok, ordered_user_assessments.compact
    end

    private

    def campaign_ordered_user_assessments(campaign) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      groups = campaign.campaign_assessment_groups.sort_by(&:position)
      ungrouped_assessment_ids = campaign.campaign_assessments.select { |ca| ca.campaign_assessment_group_id.nil? }.
                                 sort_by(&:position).map(&:assessment_id)
      grouped_assessment_ids = groups.reduce([]) do |ids, group|
        ids + group.campaign_assessments.sort_by(&:position).map(&:assessment_id)
      end
      all_campaigns_assessment_ids = grouped_assessment_ids + ungrouped_assessment_ids

      ordered_user_assessments = all_campaigns_assessment_ids.map do |assessment_id|
        indexed_user_assessments[[campaign.id, assessment_id]]
      end
      ordered_user_assessments += user_assessments.reject do |ua|
        ua.campaign_id != campaign.id || all_campaigns_assessment_ids.include?(ua.assessment_id)
      end.sort_by(&:id)
      ordered_user_assessments
    end

    def indexed_user_assessments
      @indexed_user_assessments ||= user_assessments.index_by { |ua| [ua.campaign_id, ua.assessment_id] }
    end

    def user_assessments
      user_assessments = user.user_assessments.self_assessment.order(id: :desc).includes(:assessment)
      campaign_id ? user_assessments.where(campaign_id: campaign_id) : user_assessments
    end

    def campaigns
      if campaign_id
        [Campaign.find(campaign_id)]
      else
        user.campaigns.active.order(id: :desc).includes(campaign_assessment_groups: :campaign_assessments)
      end
    end
  end
end
