# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Concerns
        module MockedResponse
          extend ActiveSupport::Concern

          included do
            class_attribute :mocked_actions
            class_attribute :custom_mocked_actions
            prepend_before_action :handle_mocked_response
          end

          class_methods do
            def mock_crud_actions(options = {})
              actions = %i[index show create update destroy]
              actions &= options[:only].map(&:to_sym) if options[:only]
              actions -= options[:except].map(&:to_sym) if options[:except]

              self.mocked_actions = actions
            end

            def mock_custom_actions(actions = [])
              self.custom_mocked_actions = actions&.map(&:to_sym)

              custom_mocked_actions&.each do |action|
                # rubocop:disable Lint/EmptyBlock
                define_method(action) do
                end
                # rubocop:enable Lint/EmptyBlock
              end
            end
          end

          private

          def handle_mocked_response
            action_name = params[:action].to_sym

            return unless mocked_actions&.include?(action_name) || custom_mocked_actions&.include?(action_name)

            mock_file_name = custom_mocked_actions&.find { |action| action == action_name } || 'index'

            file_path = Rails.root.join(
              'app', 'controllers', 'api', 'v2', 'administration', "#{controller_name}_mocks", "#{mock_file_name}.json"
            ).to_s

            return unless File.exist?(file_path)

            file = File.read(file_path)
            json_data = JSON.parse(file)

            render json: mocked_response(action_name, json_data), status: status_for_action(action_name)
          end

          def mocked_response(action_name, json_data)
            case action_name
              when :update
                update_resource(json_data)
                { data: find_data_by_id(json_data, params[:id]) }
              when :show
                { data: find_data_by_id(json_data, params[:id]) }
              when :create
                create_resource(json_data)
                { data: json_data['data'].last }
              when :destroy
                delete_data_by_id(json_data, params[:id])
                { data: json_data['data'] }
              else
                json_data
            end
          end

          def status_for_action(action_name)
            case action_name
              when :create
                :created
              when :destroy
                :no_content
              else
                :ok
            end
          end

          def find_data_by_id(json_data, id)
            json_data['data'].find { |data| data['id'] == id }
          end

          def delete_data_by_id(json_data, id)
            json_data['data'].delete_if { |data| data['id'] == id }
          end

          def update_resource(json_data)
            id = params[:id]
            resource = json_data['data'].find { |data| data['id'] == id }

            resource['attributes'].merge!(permitted_params) if resource
          end

          def create_resource(json_data)
            new_id = json_data['data'].map { |data| data['id'].to_i }.max + 1
            resource = { id: new_id.to_s, type: controller_name.singularize, attributes: permitted_params }

            json_data['data'] << resource
          end
        end
      end
    end
  end
end
