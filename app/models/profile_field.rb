# frozen_string_literal: true

class ProfileField < ApplicationRecord
  audited

  belongs_to :question
  belongs_to :profile_setting

  default_scope -> { order(:position) }
end
