# frozen_string_literal: true

module Users
  class Regular < User
    def scope
      :user
    end

    def project_membership
      Membership.find_by(client_id: project.id, user_id: id)
    end

    def sso_key
      "sso/#{id}/#{project_id}"
    end
  end
end
