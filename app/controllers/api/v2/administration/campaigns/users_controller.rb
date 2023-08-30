# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::UsersController < Api::V2::Administration::BaseController
    def policy_class
      @policy_class ||= Api::Administration::Campaigns::UserPolicy
    end
  end
end
