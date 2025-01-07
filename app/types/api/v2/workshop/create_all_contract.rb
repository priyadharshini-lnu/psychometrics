# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class CreateAllContract < Api::Base::Contract
        config.messages.namespace = :workshops

        # TODO: implement this rules with exact error keys
        # rule(data: { attributes: :workshops }) do
        #   index = 0
        #   assessor_id = 1

        #   key([:data, :attributes, :workshops, index, :assessor_ids]).failure(
        #     :no_available_assessor_slots,
        #     assessor: assessor_id
        #   )
        # end

        # rule(data: { attributes: :workshops }) do
        #   index = 0
        #   manager_id = 1

        #   key([:data, :attributes, :workshops, index, :manager_ids]).failure(
        #     :no_available_manager_slots,
        #     manager: manager_id
        #   )
        # end

        rule(data: { attributes: :workshops }) do
          workshops = values.dig(:data, :attributes, :workshops)

          workshops.each_with_index do |workshop, index|
            workshop_resources = workshop[:workshop_resources]
            workshop_resources.each_with_index do |resource, resource_index|
              if resource[:name].blank?
                key(
                  [:data, :attributes, :workshops, index, :workshop_resources, resource_index, :name]
                ).failure(:filled?)
              end
              next if Utility::Url.valid?(resource[:url])

              key(
                [:data, :attributes, :workshops, index, :workshop_resources, resource_index, :url]
              ).failure(I18n.t('activerecord.errors.messages.invalid_http_url'))
            end
          end
        end

        schema Api::V2::Workshop::Schema.create_all_request
      end
    end
  end
end
