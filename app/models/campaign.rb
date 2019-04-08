class Campaign < ApplicationRecord
  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, foreign_key: :campaign_id, class_name: "Threesixty::Campaign", dependent: :destroy

  accepts_nested_attributes_for :threesixty_campaign
end
