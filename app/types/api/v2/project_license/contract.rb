# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class Contract < Api::Base::Contract
        rule(data: { attributes: :usage_limit }) do
          parent_license = get_parent_license(values, _context)

          next unless parent_license

          if value > parent_license.number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes' \
                          '.usage_limit.cant_be_more_than_available',
                          usage_limit: parent_license.number
                        ))
          end
        end

        private

        def get_parent_license(values, context)
          attrs = values[:data][:attributes]
          if attrs.key?(:license_id)
            ::License.find_by(id: attrs[:license_id])
          else
            project_license = ::ProjectLicense.find_by(id: context[:params][:id])
            project_license&.license
          end
        end
      end
    end
  end
end
