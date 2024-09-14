# frozen_string_literal: true

module Threesixty
  class InstructionTemplateSerializer < Panko::Serializer
    attributes :id, :name, :content, :enabled
  end
end
