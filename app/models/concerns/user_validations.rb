# frozen_string_literal: true

module UserValidations
  extend ActiveSupport::Concern
  included do
    validates :first_name, :last_name, :email, length: { maximum: 100 }
  end
end
