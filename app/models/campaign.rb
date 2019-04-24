class Campaign < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy
  has_many :relationships

  THREESIXTY = :threesixty

  enum type: %i[common threesixty]
end
