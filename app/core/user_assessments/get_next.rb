# frozen_string_literal: true

module UserAssessments
  class GetNext < BaseCommand
    private_attr_reader :user_assessment, :campaign

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @campaign = user_assessment.campaign
    end

    def call
      groups = campaign.campaign_assessment_groups.order(:position).includes(:campaign_assessments)
      ungroupd = campaign.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
      groupd_assessments = groups.reduce([]) do |ids, group|
        ids + group.campaign_assessments.sort_by(&:position).map(&:assessment_id)
      end
      assessment_ids = groupd_assessments + ungroupd - [user_assessment.assessment_id]

      ordered_assessments = user_assessment.campaign_user.campaign_user_assessments.self_assessment.
                            where(assessment_id: assessment_ids).
                            where(status: %i[not_started in_progress interrupted])

      @next = ordered_assessments.first { |a| assessment_ids.include?(a.id) }

      return broadcast(:ok, nil) unless @next

      broadcast :ok, @next
    end
  end
end
