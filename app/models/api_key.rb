class ApiKey < ApplicationRecord
  belongs_to :user

  scope :active, -> { where(active: true) }
end
