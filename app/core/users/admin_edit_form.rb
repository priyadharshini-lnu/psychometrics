# frozen_string_literal: true

module Users
  class AdminEditForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String

    validates :first_name, :last_name, presence: true
    validates :first_name, :last_name, :email, csv_injection_check: true
  end
end
