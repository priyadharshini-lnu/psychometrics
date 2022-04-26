# frozen_string_literal: true

module Api
  module Base
    class GenerateSwagger < BaseCommand
      attr_reader :schema, :options

      def initialize(schema, options = {})
        @schema = schema
        @options = options
      end

      def call
        this = self
        klass = Class.new(Dry::Validation::Contract) do
          schema this.schema
        end

        broadcast :ok, Dry::Swagger::ContractParser.new.call(klass).to_swagger
      end
    end
  end
end
