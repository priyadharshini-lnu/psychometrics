# frozen_string_literal: true

module Api
  module Administration
    class CampaignAssessmentPolicy < BasePolicy
      def index?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        has_permission?(:workshops, :manage)
      end
    end
  end
end
