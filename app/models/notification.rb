class Notification < ApplicationRecord
  validates :text, presence: true
end
