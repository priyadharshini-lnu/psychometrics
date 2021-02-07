# frozen_string_literal: true

module DatasheetRows
  class Form < Rectify::Form
    attribute :email, String
    attribute :data, Hash

    validates :email, presence: true
  end
end
