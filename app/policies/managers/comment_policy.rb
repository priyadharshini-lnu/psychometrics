# frozen_string_literal: true

module Managers
  class CommentPolicy < BasePolicy
    def create?
      @current_user.is? :manager
    end
  end
end
