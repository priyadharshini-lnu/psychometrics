module Users
  class InvitationsController < Devise::InvitationsController
    layout 'devise'
    prepend_before_action :sign_out, :only => [:edit]

    def update
      super
      return unless current_user
      current_user.memberships.find_by(client: @current_project).update_columns(already_invited: true)
    end
  end
end
