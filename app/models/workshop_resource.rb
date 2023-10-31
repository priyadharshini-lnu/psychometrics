# frozen_string_literal: true

class WorkshopResource < ApplicationRecord
  audited

  belongs_to :workshop
end
