module Users
  class InvitationsController < Devise::InvitationsController
    prepend_before_action :sign_out, :only => [:edit]
  end
end
