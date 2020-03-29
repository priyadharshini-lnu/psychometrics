# frozen_string_literal: true

module Assigns
  class AgileEventForm < Rectify::Form
    attribute :session_id, String
    attribute :event, String
    attribute :data, Hash
  end
end
