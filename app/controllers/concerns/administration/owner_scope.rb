module Administration
  module OwnerScope
    extend ActiveSupport::Concern

    included do
      append_before_action :check_owner, only: [:update]
    end

    private
    def check_owner
      return if current_user.is?(:superadmin)
      unless current_user.client_ids.include? resource_params[:owner_id].to_i
        user_not_authorized
      end
    end
  end
end
