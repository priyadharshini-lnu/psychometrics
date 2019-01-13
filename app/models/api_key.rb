class ApiKey < ApplicationRecord
  belongs_to :user, class_name: User

  scope :active, -> { where(active: true) }
end
