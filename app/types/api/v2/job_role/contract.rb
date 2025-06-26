# frozen_string_literal: true

module Api
  module V2
    module JobRole
      class Contract < Api::Base::Contract
        config.messages.namespace = :job_roles

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :description }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :job_group_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :name }) do
          job_group_id = values.dig(:data, :attributes, :job_group_id)
          name = values.dig(:data, :attributes, :name)

          if name && job_group_id
            existing_job_role = ::JobRole.find_by(
              name: name,
              job_group_id: job_group_id
            )

            if existing_job_role && existing_job_role.id.to_s != _context[:params][:id]
              key.failure(:unique_within_job_group)
            end
          end
        end
      end
    end
  end
end
