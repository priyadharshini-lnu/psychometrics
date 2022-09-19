# frozen_string_literal: true

module Assessments
  class BlockSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions

    def questions
      object.questions_ams.map do |q|
        Assessments::QuestionSerializer.new(q)
      end
    end

    def deleted
      !!object.deleted_at
    end

    def created_at
      I18n.l object.created_at, format: :short
    end
  end
end
