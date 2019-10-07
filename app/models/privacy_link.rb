# frozen_string_literal: true

class PrivacyLink < ApplicationRecord
  belongs_to :client

  validates :text, :link, presence: true
  validates :link, http_url: true
end
