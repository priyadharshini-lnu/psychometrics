# frozen_string_literal: true

class SheetRow < ApplicationRecord
  audited

  belongs_to :sheet, inverse_of: :rows
  has_many :sheet_row_data, dependent: :destroy
  include Tenantable

  tenant_source :sheet

  before_save { self.email = email&.downcase }

  delegate :sheet_columns, :column_names, to: :sheet

  def datasheet
    sheet
  end

  def log_attribute_for_delete
    slice(:id, :email)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id sheet_id email]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[audits sheet sheet_row_data]
  end
end
