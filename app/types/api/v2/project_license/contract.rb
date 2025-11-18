module Api
  module V2
    module ProjectLicense
      class Contract < Api::Base::Contract
        config.messages.namespace =
          'activemodel.errors.models.project_license.attributes'

        # Common validations applied for both create and update
        rule(data: { attributes: :usage_limit }) do
          attrs = values[:data][:attributes]
          usage_limit = attrs[:usage_limit]
          license_id  = attrs[:license_id]

          # Find the parent license (whether create or update)
          parent_license =
            if _context[:project_license]
              _context[:project_license].license
            else
              ::License.find_by(id: license_id)
            end

          next unless parent_license

          # Do NOT allow usage_limit > parent_license.number
          if usage_limit > parent_license.number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes.usage_limit.cant_be_more_than_available',
                          usage_limit: parent_license.number
                        ))
          end
        end
      end
    end
  end
end
