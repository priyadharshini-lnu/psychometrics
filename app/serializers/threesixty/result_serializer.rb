module Threesixty
  class ResultSerializer < ActiveModel::Serializer
    attributes :id, :subject_id, :created_at, :completed_at

    def subject_id
      object.threesixty_subject.id
    end
  end
end
