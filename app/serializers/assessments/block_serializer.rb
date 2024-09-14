# frozen_string_literal: true

module Assessments
  class BlockSerializer < Panko::Serializer
    attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions

    def questions
      Panko::ArraySerializer.new(
        object.questions_ams,
        each_serializer: Assessments::QuestionSerializer
      ).to_a
    end

    def deleted
      !!object.deleted_at
    end

    def created_at
      I18n.l object.created_at, format: :short
    end
  end
end
