# frozen_string_literal: true

module Assessments
  class QuestionSerializer < ActiveModel::Serializer
    attributes :id, :name, :type, :position, :props, :deleted, :created_at,
               :validation, :required_validation, :display_logic, :skip_logic, :template_id, :block_id

    has_many :comments, serializer: Assessments::CommentSerializer

    def deleted
      !!object.deleted_at
    end
  end
end
