# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class UpdateContract < Contract
        schema Api::V2::ProjectLicense::Schema.update_request

        rule(data: { attributes: :usage_limit }) do
          project_license = ::ProjectLicense.find_by(id: _context[:params][:id])
          next unless project_license

          used_number    = project_license.used_number

          if used_number && value < used_number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes' \
                          '.usage_limit.cant_be_less_than_used', used_count: used_number
                        ))
          end
        end
      end
    end
  end
end
