module Imports
  class UserImport < Imports::BaseImport
    attr_accessor :client_id, :importer
    validates :client_id, :importer, presence: true

    # Authorisation flow
    #
    include Pundit
    ## Prepend :administration namespace to policy
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      importer
    end

    USER_ROLES_MAPS = {
      'Client Admin' => User::USER_ROLES[:admin],
      'Manager' => User::USER_ROLES[:manager],
      'User' => User::USER_ROLES[:member]
    }.freeze

    HEADER_IMPORT_RULES = {
      email: /Email Address|Email|E-mail/i,
      first_name: /First Name/i,
      last_name: /Last Name/i,
      role: /Role/i
    }.freeze

    SKIP_HEADER_RULES = /\ACreated Date\z|\AActive\z/i

    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv'] }

    def process!
      # Return error if form not valid
      return false unless valid?

      imported_items = load_imported_items.compact

      if imported_items.map(&:valid?).all?
        imported_items.each(&:save!).each { |i| i.invite!(importer, client_id) }
      else
        imported_items.each_with_index do |user, index|
          user.errors.full_messages.each do |message|
            errors.add(:base, I18n.t('administration.imports.errors.error', row: index + 2, error: message))
          end
        end
      end

      errors.blank?
    end

    #
    # Parse file
    # Return array of new Users
    #
    def load_imported_items
      # Parse header of xls/csv by strict rules
      rows = open_spreadsheet.parse
      header = rows.shift

      rows.map do |row|
        users_attributes = { operator: importer }
        memberships_attributes = {}
        header.zip(row).each_with_index do |z, i|
          next if z.first =~ SKIP_HEADER_RULES
          (users_attributes[:email] = z.last) && next if z.first =~ HEADER_IMPORT_RULES[:email]
          (users_attributes[:first_name] = z.last) && next if z.first =~ HEADER_IMPORT_RULES[:first_name]
          (users_attributes[:last_name] = z.last) && next if z.first =~ HEADER_IMPORT_RULES[:last_name]
          (users_attributes[:role] = USER_ROLES_MAPS[z.last]) && next if z.first =~ HEADER_IMPORT_RULES[:role]
          memberships_attributes[:client_id] = policy_scope(::Client).find(client_id).id
          memberships_attributes[:hris_data] ||= {}
          memberships_attributes[:hris_data][i.to_s] = { key: z.first, value: z.last }
        end
        user = User.new(users_attributes)
        # TODO: Refactoring this place, case we validate object twice
        user.memberships.build(memberships_attributes) if user.valid?
        user
      end

    # Pick up error when header has invalid format
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
  end
end
