# frozen_string_literal: true

# TODO: Remove the file and make the change in our fork repo
module ActionDispatch::Routing
  class Mapper
    protected

    def devise_two_factor_authentication(mapping, controllers)
      resource :two_factor_authentication, only: %i[show update],
path: mapping.path_names[:two_factor_authentication], controller: controllers[:two_factor_authentication] do
        # Define the resend_code route explicitly, without including it in :only above
        collection { get 'resend_code' }
      end
    end
  end
end
