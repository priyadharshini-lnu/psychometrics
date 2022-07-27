# frozen_string_literal: true

class Dashboard < ApplicationRecord
  mount_base64_uploader :image, ImageUploader

  belongs_to :campaign

  after_commit on: [:create] do
    Dashboards::CreateFlatSheetView.call!(campaign.datasheet) if campaign.datasheet
  end

  scope :preview_available, ->(*) { where(enabled: true).where('dataset_id IS NOT NULL AND report_id IS NOT NULL') }

  def self.ransackable_scopes(_)
    %i[preview_available]
  end
end
