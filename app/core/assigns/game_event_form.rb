# frozen_string_literal: true

module Assigns
  class GameEventForm < Rectify::Form
    attribute :session_id, String
    attribute :event, String
    attribute :data, Hash
  end
end
