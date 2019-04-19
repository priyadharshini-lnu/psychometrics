module Threesixty
  class SubjectsRelationship < ApplicationRecord
    belongs_to :subject
    belongs_to :relationship
    belongs_to :campaign, class_name: '::Campaign'
  end
end
