# frozen_string_literal: true

task generate_dynamic_swagger_schema: :environment do
  require './spec/swagger/v2/schema'

  Swagger::V2.generate_dynamic_schema
end
