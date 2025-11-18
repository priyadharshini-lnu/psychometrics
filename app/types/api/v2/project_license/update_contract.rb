# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class UpdateContract < Contract
        rule(data: { attributes: :usage_limit }) do
          next unless _context[:project_license]

          usage_limit    = value
          used_number    = _context[:project_license].used_number

          if usage_limit < used_number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes' +
                          '.usage_limit.cant_be_less_than_used', used_count: used_number
                        ))
          end
        end
      end
    end
  end
end
