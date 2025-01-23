# frozen_string_literal: true

module Saville
  class MigrateAssessmentForm < Rectify::Form
    attribute :email, String
    attribute :to_campaign, String
    attribute :from_campaign, String
    attribute :assessment_id, String

    validate :validate_row

    private

    def validate_row
      errors.add(:base, "User not in 'from' campaign") unless user_exists_for_from_campaign?
      errors.add(:base, "User not in 'to' campaign") unless user_exists_for_to_campaign?
      errors.add(:base, "No assessment in 'to' campaign") unless has_assessment_assigned_to_campaign?
      errors.add(:base, "No assessment in 'from' campaign") unless has_assessment_assigned_from_campaign?
    end

    def user_exists_for_to_campaign?
      CampaignUser.joins(:user).exists?({ users: { email: }, campaign_id: to_campaign })
    end

    def user_exists_for_from_campaign?
      CampaignUser.joins(:user).exists?({ users: { email: }, campaign_id: from_campaign })
    end

    def has_assessment_assigned_to_campaign?
      user_assessment(to_campaign).present?
    end

    def has_assessment_assigned_from_campaign?
      user_assessment(from_campaign).present?
    end

    def user_assessment(campaign_id)
      @user_assessments ||= {}
      @user_assessments[campaign_id] ||= UserAssessment.joins(%i[subject evaluator]).find_by(
        subject: { email: }, evaluator: { email: },
        campaign_id:, assessment_id:, relationship: Relationship.self_relationship
      )
    end
  end
end
