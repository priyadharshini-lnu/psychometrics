# frozen_string_literal: true

class Threesixty::InstructionTemplateTranslation < ApplicationRecord
  belongs_to :threesixty_instruction_template, class_name: 'Threesixty::InstructionTemplate'
end
