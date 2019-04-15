module Managers
  class BaseController < ApplicationController
    # Authorisation flow
    include Pundit
    # Prepend :administration namespace to policy
    include Managers::Policies

    # Custom layout for manager panel
    layout 'users'
    # Ensuring policies and scopes are used
    after_action :verify_authorized, except: :index
    after_action :verify_policy_scoped, only: :index

    protect_from_forgery with: :exception
    add_flash_types :notice, :error, :success
  end
end
