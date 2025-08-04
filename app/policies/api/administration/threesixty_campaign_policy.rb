# frozen_string_literal: true

module Api
  module Administration
    class ThreesixtyCampaignPolicy < Administration::BasePolicy
      def create_campaign?
        has_permission?(:campaigns, :manage)
      end

      def convert_to_template?
        has_permission?(:campaigns, :manage)
      end

      def copy_as_template?
        convert_to_template?
      end
    end
  end
end
