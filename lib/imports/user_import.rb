module Imports
  class UserImport < Imports::BaseImport
    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv'] }

    def process!
      # Return error if obj not valid
      return false unless valid?

      imported_items = load_imported_items
      if imported_items.map(&:valid?).all?
        imported_items.each(&:save!).each { |i| i.invite!(importer) }
        true
      else
        imported_items.each_with_index do |user, index|
          user.errors.full_messages.each do |message|
            errors.add :file, "Row #{index + 2}: #{message}"
          end
        end
        false
      end

    rescue Roo::HeaderRowNotFoundError => e

      errors.add(:base, 'Invalid format headers')
      return false
    end

    def load_imported_items
      datas = open_spreadsheet.parse(User::USER_IMPORT_RULES)

      datas[1..-1].map do |data|
        data[:role] = User::USER_ROLES_MAPS[data[:role]]
        data[:client_ids] = Client.where(name: (data.delete(:clients) || '').split(',').map(&:strip)).pluck(:id)

        user = User.new(user_params(data))
        user.operator = importer
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

    def user_params(data)
      ActionController::Parameters.new(data).permit(:first_name, :last_name, :email,
                                                    :role, :evaluator_name, :evaluators_email_address,
                                                    :relationship, :business_unit, :department,
                                                    :job_title, :nationality, :gender, client_ids: [])
    end
  end
end
