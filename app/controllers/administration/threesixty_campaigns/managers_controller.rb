# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ManagersController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option || ::Threesixty::Option.new

        managers = policy_scope(::Threesixty::Evaluator).
                     includes(:subject, :user).
                     joins(participants: :relationship).
                     where(campaign_id: threesixty_campaign.campaign_id, participants: { relationships: { name: 'Manager' }}).
                     distinct
        counters = ::Threesixty::Participants::CalcCounters.call!(managers.map(&:user_id), threesixty_campaign)

        managers = managers.map do |m|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(m.subject, threesixty_campaign)
          ::Threesixty::EvaluatorSerializer.new(m, option: option, nomination_requirement: nomination_requirement, counters: counters).to_h
        end
        render json: managers
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end
    end
  end
end
