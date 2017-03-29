module Administration
  module OwnerCheck
    class WrongParameter < StandardError
    end

    def self.prepended(base)
      base.rescue_from WrongParameter, with: :user_not_authorized
    end

    private
    def resource_params
      # only SuperAdmin can create tte resource
      if current_user.is?(:superadmin) || params[:resource][:owner_id].present?
        super
      else
        raise WrongParameter
      end
    end
  end
end
