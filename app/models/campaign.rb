class Campaign < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy
  has_many :relationships

  enum type: %i[empty standard_360 previous_360]

  EMPTY = 'empty'
  STANDARD_360 = 'standard_360'
  PREVIOUS_360 = 'previous_360'

  TYPES = {
    EMPTY => 'Empty',
    STANDARD_360 => 'Standard 360',
    PREVIOUS_360 => 'Previous 360'
  }.freeze
end
