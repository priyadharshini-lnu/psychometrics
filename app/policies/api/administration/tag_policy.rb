# frozen_string_literal: true

module Api
  module Administration
    class TagPolicy < BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          tags = ActsAsTaggableOn::Tag.
                 joins(:taggings).
                 where(taggings: { taggable_type: filter[:taggable_resource_type] }).
                 order(taggings_count: :desc)

          return tags.distinct if @user.is?(:superadmin)

          owner_ids = @user.owner_ids
          tags.accessible_to_clients(owner_ids)
        end
      end
    end
  end
end
