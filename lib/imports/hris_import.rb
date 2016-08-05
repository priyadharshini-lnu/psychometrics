module Imports
  class HrisImport < Imports::BaseImport
    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv'] }

    def process
      return false unless valid?
      if imported_items.map(&:valid?).all?
        imported_items.each(&:save!)
        true
      else
        imported_items.each_with_index do |user, index|
          user.errors.full_messages.each do |message|
            errors.add :file, "Row #{index + 2}: #{message}"
          end
        end
        false
      end
    end

    def imported_items
      @imported_items ||= load_imported_items.compact
    end

    def load_imported_items
      datas = open_spreadsheet.parse(User::USER_IMPORT_RULES)

      datas[1..-1].map do |data|
        user = User.find_by(email: data[:email])
        unless user
          errors.add(:file, "Row #{i}: Couldn't find user")
          next
        end
        # Fetch hris data
        user.hris = hris_params(data)
        user
      end
    end

    def open_spreadsheet
      case File.extname(file.original_filename)
      when '.csv' then Roo::CSV.new(file.path)
      when '.xlsx' then ::Roo::Excelx.new(file.path)
      else raise "Unknown file type: #{file.original_filename}"
      end
    end

    protected

    def hris_params(data)
      ActionController::Parameters.new(data).permit(:evaluator_name, :evaluators_email_address,
                                                    :relationship, :business_unit, :department,
                                                    :job_title, :nationality, :gender)
    end
  end
end
