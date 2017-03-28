module Assessments
  module Actions
    module Block
      module CreateByTemplate
        # Class serialize template for create block by template
        class QuestionSerializer < ActiveModel::Serializer
          attributes :name, :type, :position, :props, :deleted, :created_at,
                     :validation, :required_validation, :display_logic, :skip_logic, :template_id

          def deleted
            !!object.deleted_at
          end
        end
      end
    end
  end
end
