module Threesixty
  class InstructionTemplateSerializer < ActiveModel::Serializer
    attributes :id, :name, :content
  end
end
