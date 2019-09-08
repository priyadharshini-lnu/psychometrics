# frozen_string_literal: true

module Libraries
  class Channel < ApplicationCable::Channel
    include ::Libraries::Actions::Library
    include Pundit
    include Administration::Policies

    def subscribed; end

    def pundit_user
      current_user
    end
  end
end
