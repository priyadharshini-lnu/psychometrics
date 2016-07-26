module Imports
  module Xls
    class HrisImport < Imports::BaseImport
      def process
        @cursor_x = 0
        @cursor_y = 0
        @headers  = []
        begin
          ActiveRecord::Base.transaction do
            @sheet = RubyXL::Parser.parse(@file)[0]
            (0..@sheet[0].cells.count).each do |cell|
              header = @sheet[0][cell].try(:value)
              # Convert datetime to right format
              header = header.strftime('%d-%b-%Y') if header.is_a?(DateTime)
              @headers << header unless header.nil?
            end
            (1..@sheet.count).each do |row|
              (0..@headers.size).each do |cell|
              @sheet[row]
            end
          end
          true
        rescue ActiveRecord::RecordInvalid => e
          raise Errors::ImportError, "[#{human_coordinates}] #{e.record.errors.full_messages[0]}"
        end
      end

      private

      def human_coordinates
        "#{(@cursor_y + 1)}-#{(@cursor_x + 1).alph.upcase}"
      end
    end
  end
end
