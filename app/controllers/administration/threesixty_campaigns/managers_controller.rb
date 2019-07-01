# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ManagersController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option || ::Threesixty::Option.new
        managers = policy_scope(::Threesixty::Evaluator).
                   includes(:user, subject: :user).
                   joins(participants: :relationship).
                   where(campaign_id: threesixty_campaign.campaign_id, participants: { relationships: { name: 'Manager' } }).
                   order(id: :desc).
                   distinct(:user_id).
                   limit(params[:limit]).
                   offset(params[:offset])

        counters = ::Threesixty::Participants::CalcCounters.call!(managers.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          managers.map(&:user_id),
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          managers.map(&:user),
          threesixty_campaign
        )
        total = policy_scope(::Threesixty::Evaluator).
                where(campaign_id: threesixty_campaign.campaign_id, participants: { relationships: { name: 'Manager' } }).
                distinct(:user_id).
                joins(participants: :relationship).
                count

        managers = managers.map do |m|
          ::Threesixty::EvaluatorSerializer.new(
            m,
            option: option,
            nomination_requirement: nomination_requirement_by_user_id[m.user_id],
            counters: counters,
            subject_evaluator_counters: subject_evaluator_counters
          ).to_h
        end
        render json: { managers: managers, total: total }
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end
    end
  end
end
