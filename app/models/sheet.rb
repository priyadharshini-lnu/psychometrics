# frozen_string_literal: true

class Sheet < ApplicationRecord
  audited

  EMAIL_COLUMN = 'Email'
  ALL_COLUMN_TYPES = %w[String Text Number HTML Markdown].freeze
  MAX_COLUMN_NAME_SIZE = 64

  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  include Tenantable

  has_many :sheet_columns, dependent: :destroy
  has_many :rows, class_name: 'SheetRow', inverse_of: :sheet, dependent: :destroy

  def column_names
    sheet_columns.map(&:name)
  end

  def parent_resource
    @parent_resource ||= project || campaign
  end

  def accesssheet?
    type == 'Accesssheet'
  end

  def datasheet?
    type == 'Datasheet'
  end
end
