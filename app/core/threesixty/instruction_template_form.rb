# frozen_string_literal: true

module Threesixty
  class InstructionTemplateForm < Rectify::Form
    attribute :content, String
    attribute :enabled, Boolean
  end
end
