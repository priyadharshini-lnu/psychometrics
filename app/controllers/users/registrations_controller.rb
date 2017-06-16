module Users
  class RegistrationsController < Devise::RegistrationsController
    before_action :configure_permitted_parameters

    # Set Client after sign up user
    def build_resource(user_params = nil)
      resource = super
      user = User.find_by(email: resource.email)
      user ||= resource
      user.client_ids += [@current_project.id]
      user.terms = true
      self.resource = user
    end

    protected

    def after_sign_up_path_for(_resource)
      root_path
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up) do |u|
        u.permit(:email, :password, :password_confirmation, :first_name, :last_name)
      end
    end
  end
end
