# frozen_string_literal: true

class DataReport < ApplicationRecord
  audited

  belongs_to :owner, class_name: 'Client'
  belongs_to :last_updated_by, class_name: 'User'

  before_save :update_last_updated_by

  has_many :data_report_jobs, dependent: :destroy

  def update_last_updated_by
    self.last_updated_by = Current.user
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name configuration created_at id_value updated_at last_updated_by_id owner_id]
  end
end
