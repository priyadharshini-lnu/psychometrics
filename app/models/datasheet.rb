class Datasheet < ApplicationRecord
  # Contains the name of column which contains Email
  EMAIL_COLUMN = 'Email'.freeze

  belongs_to :project, class_name: 'Client'
  has_many :rows, class_name: 'DatasheetRow', inverse_of: :datasheet, dependent: :destroy
end
