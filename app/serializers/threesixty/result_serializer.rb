module Threesixty
  class ResultSerializer < ActiveModel::Serializer
    attributes :id, :subject_id, :created_at, :completed_at, :hash

    def subject_id
      object.threesixty_subject.id
    end

    def hash
      UsersResult.encode_id(object.id)
    end
  end
end
