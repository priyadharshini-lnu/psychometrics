# frozen_string_literal: true

module Threesixty
  class InstructionTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :content, :enabled
  end
end
