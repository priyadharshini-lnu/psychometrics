# frozen_string_literal: true

module Administration
  module Workshops
    class UserPolicy < Administration::BasePolicy
      def search_subjects?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def search_assessors?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
