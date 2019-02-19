class Datasheet < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  has_many :rows, class_name: 'DatasheetRow', inverse_of: :datasheet, dependent: :destroy
end
