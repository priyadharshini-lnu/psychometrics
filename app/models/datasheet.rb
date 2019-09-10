# frozen_string_literal: true

class Datasheet < ApplicationRecord
  # Contains the name of column which contains Email
  EMAIL_COLUMN = 'Email'

  belongs_to :project, class_name: 'Client'
  has_many :rows, class_name: 'DatasheetRow', inverse_of: :datasheet, dependent: :destroy

  def normalize_columns
    columns.map { |k, v| { name: k, type: v } }
  end

  def column_names
    columns&.keys
  end
end
