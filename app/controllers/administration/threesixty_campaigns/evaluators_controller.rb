# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluatorsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option
        evaluators = policy_scope(::Threesixty::Evaluator).includes(:subject, :user).where(campaign_id: threesixty_campaign.campaign_id)
        counters = ::Threesixty::Participants::CalcCounters.call!(evaluators.map(&:user_id), threesixty_campaign)
        evaluators = evaluators.map do |e|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(e.subject, threesixty_campaign)
          ::Threesixty::EvaluatorSerializer.new(e, option: option, nomination_requirement: nomination_requirement, counters: counters).to_h
        end
        render json: evaluators
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
