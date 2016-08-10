module Imports
  class HrisImport < Imports::BaseImport
    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv'] }

    def process!
      # Return error if obj not valid
      return false unless valid?

      imported_items = load_imported_items.compact

      if imported_items.map(&:valid?).all?
        imported_items.each(&:save!)
      else
        imported_items.each_with_index do |user, index|
          user.errors.full_messages.each do |message|
            errors.add(:base, I18n.t('administration.imports.errors.error', row: index + 2, error: message))
          end
        end
      end

      errors.blank?
    end

    def load_imported_items
      datas = open_spreadsheet.parse(User::USER_IMPORT_RULES)

      datas[1..-1].map.with_index do |data, index|
        user = User.find_by(email: data[:email])
        if user.nil?
          errors.add(:base, I18n.t('administration.imports.errors.user.not_found', row: index + 2, email: data[:email]))
          next
        end
        # Fetch hris data
        user.attributes = hris_params(data)
        user
      end

    rescue Roo::HeaderRowNotFoundError
      errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
      [nil]
    end

    def open_spreadsheet
      case File.extname(file.original_filename)
      when '.csv' then Roo::CSV.new(file.path)
      when '.xlsx' then ::Roo::Excelx.new(file.path)
      else raise t('administration.imports.errors.unknown_type', filename: file.original_filename)
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
