# frozen_string_literal: true

module Datasheets
  class DatasheetColumnForm < Rectify::Form
    attribute :name, String
    attribute :type, String
    attribute :accessor_access, Boolean
    attribute :dashboard_use, Boolean
    attribute :visible_in_list, Boolean

    validates :name, :type, presence: true, format: { with: /\A[\w\s]+\z/ }
    validates_length_of :name, maximum: Datasheet::MAX_COLUMN_NAME_SIZE
    validates_inclusion_of :type, in: Datasheet::ALL_COLUMN_TYPES
    validate :uniqueness_field_name, if: :datasheet

    def uniqueness_field_name
      errors.add(:name, :not_unique) if datasheet.columns.find { |f| f['name'] == name }
    end

    def datasheet
      context&.datasheet
    end
  end
end
