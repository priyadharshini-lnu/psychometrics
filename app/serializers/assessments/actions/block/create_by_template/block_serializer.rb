# frozen_string_literal: true

module Assessments
  module Actions
    module Block
      module CreateByTemplate
        # Class serialize template for create block by template
        class BlockSerializer < Panko::Serializer
          attributes :name, :position, :props, :created_at, :template_id, :deleted, :questions

          def template_id
            object.id
          end

          def questions
            Panko::ArraySerializer.new(
              object.questions_ams,
              each_serializer: Assessments::Actions::Block::CreateByTemplate::QuestionSerializer
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
    end
  end
end
