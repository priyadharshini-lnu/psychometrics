# frozen_string_literal: true

module Api
  module Administration
    class TagPolicy < BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          tags = ActsAsTaggableOn::Tag.all

          return tags if @user.is?(:superadmin)

          owner_ids = @user.owner_ids
          tags.accessible_to_clients(owner_ids)
        end
      end
    end
  end
end
