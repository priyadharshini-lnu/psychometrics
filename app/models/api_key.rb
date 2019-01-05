class ApiKey < ApplicationRecord
  belongs_to :membership

  scope :active, -> { where(active: true) }
end
