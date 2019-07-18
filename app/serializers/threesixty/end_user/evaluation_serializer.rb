module Threesixty::EndUser
  class EvaluationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :evaluator_id

    has_one :user, serializer: UserSerializer

    def user
      object.evaluator
    end

    def is_self
      object.subject_id == current_user.id
    end
  end
end
