# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ClientFeaturesController < Api::V2::Administration::BaseController
        validates_request_schema :update, -> { Api::V2::ClientFeature::Contract.new }
        validate_crud_requests Api::V2::ClientFeature::Schema

        def context
          super.merge(
            client_id: params[:id]
          )
        end

        def migrate_communication_center
          client = ActsAsTenant.without_tenant { ::Client.find_by(id: params[:client_id]) }

          unless client
            render json: { error: "Client with id=#{params[:client_id]} not found" },
                   status: :not_found
            return
          end

          dry_run = ActiveModel::Type::Boolean.new.cast(params.dig(:query, :dry_run))

          if dry_run
            stats = ::CommunicationCenter::Migrate.new(client, dry_run: true).call
            render json: stats.except(:errors).merge(migration_errors: stats[:errors]), status: :ok
          else
            AdminJob.call(:migrate_communication_center, { client_id: client.id }, current_user)
            render json: { message: "Migration job enqueued for '#{client.name}' (id=#{client.id})" }
          end
        end

        private

        def authorize_migrate_communication_center
          authorize(nil, :migrate_communication_center?,
                    policy_class: Api::Administration::ClientFeaturePolicy)
        end
      end
    end
  end
end
