# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluatorsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option
        evaluators = policy_scope(::Threesixty::Evaluator).
                     includes(:user, subject: :user).
                     where(campaign_id: threesixty_campaign.campaign_id).
                     order(id: :desc).
                     limit(params[:limit]).
                     offset(params[:offset])
        counters = ::Threesixty::Participants::CalcCounters.call!(evaluators.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          evaluators.map(&:user_id),
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          evaluators.map(&:user),
          threesixty_campaign
        )
        total = policy_scope(::Threesixty::Evaluator).where(campaign_id: threesixty_campaign.campaign_id).count

        evaluators = evaluators.map do |e|
          ::Threesixty::EvaluatorSerializer.new(
            e,
            option: option,
            nomination_requirement: nomination_requirement_by_user_id[e.user_id],
            counters: counters,
            subject_evaluator_counters: subject_evaluator_counters
          ).to_h
        end
        render json: { evaluators: evaluators, total: total }
      end

      def create_all
        form = ::Threesixty::Evaluators::CreateAllForm.from_params(params).with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          ::Threesixty::Evaluators::CreateAll.call!(form.evaluators_with_relations, threesixty_campaign)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end
    end
  end
end
