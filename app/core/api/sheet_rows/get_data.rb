# frozen_string_literal: true

module Api
  module SheetRows
    class GetData < BaseCommand
      private_attr_accessor :sheet_row

      def initialize(sheet_row)
        @sheet_row = sheet_row
      end

      def call
        broadcast :ok, data
      end

      private

      def data
        ::SheetRows::GetData.call!(sheet_row).except(:id, 'Email')
      end
    end
  end
end
