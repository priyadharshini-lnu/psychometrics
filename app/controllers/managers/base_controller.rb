module Managers
  class BaseController < ApplicationController
    # Authorisation flow
    #
    include Pundit
    ## Prepend :administration namespace to policy
    include Managers::Policies
    include Authenticate

    # Ensuring policies and scopes are used
    after_action :verify_authorized, except: :index
    after_action :verify_policy_scoped, only: :index

    # Custom layout for manager panel
    layout 'users'

    protect_from_forgery with: :exception

    add_flash_types :notice, :error, :success
  end
end
