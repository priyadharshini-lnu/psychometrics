class Campaign < ApplicationRecord
  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy
end
