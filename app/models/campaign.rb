class Campaign < ApplicationRecord
  self.inheritance_column = :_type_disabled
  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy

  enum type: %i[empty standard_360 previous_360]

  TYPES = {
    empty: 'Empty',
    standard_360: 'Standard 360',
    previous_360: 'Previous 360'
  }.freeze
end
