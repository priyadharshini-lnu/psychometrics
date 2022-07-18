# frozen_string_literal: true

module SheetRows
  class Form < Rectify::Form
    attribute :email, String
    attribute :data, Hash

    validates :email, presence: true
  end
end
