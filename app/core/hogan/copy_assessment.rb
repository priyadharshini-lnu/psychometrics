# frozen_string_literal: true

module Hogan
  class CopyAssessment < BaseCommand
    private_attr_reader :form, :row_no

    def initialize(form, row_no)
      @form = form
      @row_no = row_no
    end

    def call
      unless source_user_credential
        Rails.logger.info(
          "Row #{row_no}: Skipped! Hogan Credential not present at source for user with id #{source_campaign_user.user_id}" # rubocop:disable Layout/LineLength
        )
        return
      end

      ActiveRecord::Base.transaction do
        existing_result = find_existing_result
        user_result = create_user_result(existing_result)
        target_user_credential = copy_hogan_credentials(target_user_assessment)
        user_assessment = update_user_assessment(user_result)
        user_assessment.attach_hogan_credential(target_user_credential)
        Hogan::HandleAssessmentCompletion.call!(user_assessment)
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

    def copy_hogan_credentials(user_assessment)
      target_subject = user_assessment.subject

      target_user_credential = target_subject.hogan_credential

      if target_user_credential && (source_user_credential.participant_id != target_user_credential.participant_id)
        raise "Row #{row_no}: Aborted! Hogan Credential present at target for user with id #{target_subject.id}"
      end

      credential = source_user_credential&.dup

      credential.user_id = target_subject.id
      credential.save

      credential
    end

    def target_subject
      @target_subject ||= target_user_assessment.subject
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

    def source_user_credential
      @source_user_credential ||= HoganCredential.find_by(user_id: source_campaign_user.user_id)
    end

    def source_campaign_user
      @source_campaign_user ||= CampaignUser.joins(:user).find_by(
        campaign_id: form.from_campaign, users: { email: form.email }
      )
    end
  end
end
