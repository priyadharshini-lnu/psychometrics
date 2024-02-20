# frozen_string_literal: true

class TextModuleOverride < ApplicationRecord
  audited

  belongs_to :user_report
  belongs_to :module
  belongs_to :editor, class_name: 'User'
end
