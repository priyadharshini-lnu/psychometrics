class Campaign < ApplicationRecord
  has_many :relationships
  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign'
  belongs_to :project, class_name: 'Client'
end
