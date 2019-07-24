# frozen_string_literal: true

module Threesixty
  class CampaignDetailsSerializer < ActiveModel::Serializer
    attributes :invited_evaluators, :received_evaluations, :total_evaluators_for_assessment, :options

    def invited_evaluators
      Threesixty::Participant.active.where(campaign_id: object.campaign_id, subject_id: user_id).where.not(evaluator_id: user_id).count
    end

    def received_evaluations
      if object.option.participants.dig('manager', 'can_approves_evaluations')
        Threesixty::Participant.where(subject_id: user_id, manager_nomination_status: :approved, campaign_id: object.campaign_id).count
      else
        UsersResult.where(subject_id: user_id, status: :completed, assessment_id: object.assessment_id).count
      end
    end

    def user_id
      instance_options[:users_report].user_id
    end

    def total_evaluators_for_assessment
      Threesixty::Participant.active.where(campaign_id: object.campaign_id).count
    end

    def options
      {
        can_approves_evaluations: !!object.option.participants.dig('manager', 'can_approves_evaluations')
      }
    end
  end
end
