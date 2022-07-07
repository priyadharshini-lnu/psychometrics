# frozen_string_literal: true

class Dashboard < ApplicationRecord
  belongs_to :campaign

  after_commit on: [:create] do
    Dashboards::CreateFlatSheetView.call!(campaign.datasheet) if campaign.datasheet
  end
end
