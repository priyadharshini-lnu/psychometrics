# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluatorsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option || ::Threesixty::Option.new

        evaluators = policy_scope(::Threesixty::Evaluator).
                     includes(:subject, :user).
                     where(campaign_id: threesixty_campaign.campaign_id).
                     map do |e|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(e.subject)
          ::Threesixty::EvaluatorSerializer.new(e, option: option, nomination_requirement: nomination_requirement).to_h
        end
        render json: evaluators
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end
    end
  end
end
