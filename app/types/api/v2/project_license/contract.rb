# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class Contract < Api::Base::Contract
        config.messages.namespace =
          'activemodel.errors.models.project_license.attributes'

        rule(data: { attributes: :usage_limit }) do
          attrs = values[:data][:attributes]
          usage_limit = value
          license_id  = attrs[:license_id]

          parent_license =
            if _context[:project_license]
              _context[:project_license].license
            else
              ::License.find_by(id: license_id)
            end

          next unless parent_license

          if usage_limit > parent_license.number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes' \
                          '.usage_limit.cant_be_more_than_available',
                          usage_limit: parent_license.number
                        ))
          end
        end
      end
    end
  end
end
