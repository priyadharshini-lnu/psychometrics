# frozen_string_literal: true

class WorkshopInvite < ApplicationRecord
  extend Mobility
  has_many :workshop_invited_subjects, dependent: :destroy
  has_and_belongs_to_many :workshops, dependent: :destroy

  translates :title, :description
end
