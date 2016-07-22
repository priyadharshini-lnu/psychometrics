module Imports
  module Csv
    class UserImport < Imports::BaseImport
      OPTIONS = {
        #
        # Remove columns if they didn't listed in `key_mapping`
        remove_unmapped_keys: true,
        #
        # Key - that what we found in csv file
        # Value - that we want see after parse
        key_mapping: {
          first_name: :first_name,
          last_name: :last_name,
          e_mail: :email,
          email: :email
        }
      }.freeze

      def process
        row = 1
        User.transaction do
          SmarterCSV.process(@file.path, OPTIONS) do |users|
            users.each do |user|
              row += 1
              begin
                user = User.create!(user)
              rescue ActiveRecord::RecordInvalid => e
                raise ::Errors::ImportError, I18n.t('administration.imports.csv.not_valid', row: row, error: e.to_s)
              end
              user.invite!(@importer)
            end
          end
        end
      end
    end
  end
end
