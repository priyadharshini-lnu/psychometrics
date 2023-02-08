# frozen_string_literal: true

class GetUserGrants < BaseCommand
  private_attr_accessor :user, :project_id

  def initialize(user, project_id)
    @user = user
    @project_id = project_id
  end

  def call
    project = Client.find(project_id)

    project_based_client_ids = [project.id, project.parent_id].compact

    grants = user.memberships.includes(:grants).where(
      client_id: project_based_client_ids, role: [Membership::CLIENT_ADMIN_ROLE, Membership::PROJECT_ADMIN_ROLE]
    ).pluck(:data)

    return broadcast(:ok, {}) if grants.empty?

    user_premissions = if grants.one?
                         grants[0]
                       else
                         grants[0].merge(grants[1]) do |_grant_key, grant_old_value, grant_new_value|
                           grant_old_value | grant_new_value
                         end
                       end
    broadcast :ok, user_premissions
  end
end
