# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ManagersController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      append_before_action :pundit_authorize
      before_action :skip_policy_scope, only: [:index]

      def index
        option = threesixty_campaign.option || ::Threesixty::Option.new

        managers = ::Threesixty::GetManagersQuery.new(threesixty_campaign).query

        paginated_managers = managers.page(params[:page])
        paginated_manager_ids = paginated_managers.map(&:user_id)
        counters = ::Threesixty::Participants::CalcCounters.call!(paginated_manager_ids, threesixty_campaign)
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          paginated_manager_ids,
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          paginated_managers.map(&:user),
          threesixty_campaign
        )
        total = managers.count

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
