# frozen_string_literal: true

class DataReport < ApplicationRecord
  include GeoFilterable

  audited

  belongs_to :owner, class_name: 'Client'
  belongs_to :last_updated_by, class_name: 'User'

  before_save :update_last_updated_by

  has_many :data_report_jobs, dependent: :destroy

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(:owner).where.not(clients: { tte_id: restricted_client_subquery })
  end

  def update_last_updated_by
    self.last_updated_by = Current.user
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name configuration created_at id_value updated_at last_updated_by_id owner_id]
  end
end
