module Threesixty
  class SubjectsRelationship < ApplicationRecord
    belongs_to :subject, class_name: '::User'
    belongs_to :relationship, class_name: '::Relationship'
    belongs_to :campaign, class_name: '::Campaign'
  end
end
