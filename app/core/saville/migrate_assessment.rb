# frozen_string_literal: true

module Saville
  class MigrateAssessment < BaseCommand
    private_attr_reader :form, :source_campaign_user

    def initialize(form, _row_no)
      @form = form
      @source_campaign_user = CampaignUser.joins(:user).find_by(
        campaign_id: form.from_campaign, users: { email: form.email }
      )
    end

    def call
      ActiveRecord::Base.transaction do
        existing_result = find_existing_result
        user_result = create_user_result(existing_result)
        user_assessment = update_user_assessment(user_result)
        create_saville_assessment(user_assessment, existing_result)
        ::UsersResults::RecomputeJob.perform_later(
          user_assessment.users_result,
          user_assessment.user
        )
      end
    end

    private

    def find_existing_result
      source_campaign_user.evaluation_results.
        order(created_at: :desc).
        find_by(user_assessments: { assessment_id: form.assessment_id, campaign_id: form.from_campaign })
    end

    def create_user_result(existing_result)
      existing_result ? UsersResults::Copy.call!(existing_result) : UsersResult.create!
    end

    def update_user_assessment(user_result)
      user_assessment = target_user_assessment
      user_assessment.users_result_id = user_result.id
      user_assessment.status = source_user_assessment&.status
      user_assessment.completed_at = source_user_assessment&.completed_at
      user_assessment.completion_reason = source_user_assessment&.completion_reason
      user_assessment.save!

      user_assessment
    end

    def create_saville_assessment(user_assessment, existing_result)
      existing_saville_user_assessment = existing_result&.saville_user_assessment
      saville_user_assessment = user_assessment.saville_user_assessment

      saville_user_assessment.assign_attributes(
        norm_id: existing_saville_user_assessment&.norm_id || user_assessment.applicable_external_norm_id,
        data_seprator: existing_saville_user_assessment&.data_seprator,
        candidate_id: existing_saville_user_assessment&.candidate_id
      )

      saville_user_assessment.save!
    end

    def target_user_assessment
      @target_user_assessment ||= UserAssessment.joins(%i[subject evaluator]).find_by(
        subject: { email: form.email },
        evaluator: { email: form.email },
        campaign_id: form.to_campaign,
        assessment_id: form.assessment_id,
        relationship: Relationship.self_relationship
      )
    end

    def source_user_assessment
      @source_user_assessment ||= UserAssessment.joins(%i[subject evaluator]).find_by(
        subject: { email: form.email },
        evaluator: { email: form.email },
        campaign_id: form.from_campaign,
        assessment_id: form.assessment_id,
        relationship: Relationship.self_relationship
      )
    end
  end
end
