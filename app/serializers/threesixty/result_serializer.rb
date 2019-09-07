module Threesixty
  class ResultSerializer < ActiveModel::Serializer
    attributes :id, :subject_id

    def subject_id
      object.threesixty_subject.id
    end
  end
end
