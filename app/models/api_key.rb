class ApiKey < ApplicationRecord
  belongs_to :user, class_name: Users::Admin

  scope :active, -> { where(active: true) }
end
