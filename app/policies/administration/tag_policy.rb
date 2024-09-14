# frozen_string_literal: true

class Administration::TagPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      tags = ActsAsTaggableOn::Tag.all

      return tags if @user.is?(:superadmin)

      owner_ids = @user.owner_ids
      tags.for_specific_tenants_and_common(owner_ids)
    end
  end
end
