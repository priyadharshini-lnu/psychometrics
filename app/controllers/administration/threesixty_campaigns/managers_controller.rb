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
        datasheet_row_map = threesixty_campaign.datasheet&.rows.where(email: managers.map { |m| m.user.email }).index_by(&:email)
        nomination_requirements = threesixty_campaign.nomination_requirements.order(:position)
        total = policy_scope(::Threesixty::Evaluator).
                where(campaign_id: threesixty_campaign.campaign_id, participants: { relationships: { name: 'Manager' } }).
                distinct(:user_id).
                joins(participants: :relationship).
                count

        managers = managers.map do |m|
          nomination_requirement =
            if m.subject
              ::Threesixty::NominationRequirements::FindForSubject.call!(
                m.subject,
                threesixty_campaign,
                datasheet_row_map,
                nomination_requirements
              )
            end
          ::Threesixty::EvaluatorSerializer.new(
            m,
            option: option,
            nomination_requirement: nomination_requirement,
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
