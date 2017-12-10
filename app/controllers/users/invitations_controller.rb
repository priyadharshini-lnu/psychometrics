module Users
  class InvitationsController < Devise::InvitationsController
    prepend_before_action :sign_out, :only => [:edit]

    def update
      super
      current_user.memberships.find_by(client: @current_project).update_columns(already_invited: true)
    end
  end
end
