# frozen_string_literal: true

require 'carrierwave/storage/fog'

class MediaResponse < ApplicationRecord
  mount_uploader :asset, MediaResponseUploader

  belongs_to :users_assessment
  belongs_to :question
  belongs_to :assign
  belongs_to :users_result

  validates :asset, filename_format: true if Rails.env.production?

  def filename
    asset&.filename&.split('/')&.last
  end
end
