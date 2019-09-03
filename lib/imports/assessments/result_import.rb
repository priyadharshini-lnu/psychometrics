module Imports
  module Assessments
    class ResultImport < Imports::BaseImport
      SUPPORT_ROWS = 2
      SKIP_ROWS = SUPPORT_ROWS + 2 # for calculate right index of row in Excel
      # Authorisation flow
      #
      include Pundit
      ## Prepend :administration namespace to policy
      include Administration::Policies
      include Virtus.model

      attr_accessor :importer

      attribute :scoring, Boolean, default: false
      attribute :assessment_id, Integer
      attribute :client_id, Integer

      validates :assessment_id, :client_id, :importer, presence: true
      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv',
                                                    'application/octet-stream',
                                                    'text/plain'] }

      def process!
        # Return error if form not valid
        return false unless valid?

        imported_items = load_imported_items.compact

        if imported_items.map(&:valid?).all?
          imported_items.each(&:save!)
        else
          imported_items.each_with_index do |item, index|
            item.errors.full_messages.each do |message|
              errors.add(:base, I18n.t('administration.imports.errors.result.error', row: index + SKIP_ROWS, error: message))
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
        rows = open_spreadsheet.to_a
        header = rows.shift.map { |h| h.to_s.tr(' ', '').underscore }

        # Remove support row
        SUPPORT_ROWS.times { rows.shift }
        questions = Question.
                    joining { block }.
                    not_deleted.
                    selecting { [id, type, props] }.
                    where.has { |q| q.block.assessment_id == assessment_id }.
                    ordering { [block.position.asc, position.asc] }.
                    group_by(&:id)

        rows.each_with_index.map do |row, index|
          data = Hash[header.zip(row)]
          # Try to find assign by encoded id
          begin
            assign = Assign.includes(:membership).find_by_encoded_id(data['result_id']) if data['result_id'].present?
          rescue ActiveRecord::RecordNotFound
            errors.add(:base, I18n.t('administration.imports.errors.result.invalid_assign', row: index + SKIP_ROWS))
            return [nil]
          end

          # If Assign not found, going to create user
          unless assign
            membership = Membership.joins(:user).where(users: { email: data['email'].to_s.downcase }, client_id: client_id).first
            membership = find_or_create_user(data, index) unless membership
            next unless membership
            assign = membership.assigns.find_or_create_by({ assessment_id: assessment_id })
          end

          status = if data['status'] == 'Completed'
                     :completed
                   elsif data['status'] == 'New'
                     :not_started
                   else
                     :in_progress
                   end
          assign.assign_attributes({
            started_at:  parse_date(data['started_at'], index),
            completed_at: parse_date(data['completed_at'], index),
            norm_data: parse_norm_data(data['norm_data'], assign.assessment_id),
            status: status
            })

          parsed_questions = {}
          new_results = {}

          # Parse answers
          data.each do |key, value|
            next unless key =~ /qid/
            # Parse QID and answer's props
            qid, _props = key.split(/\D+/).reject(&:blank?).map(&:to_i)
            parsed_questions[qid] ||= []
            parsed_questions[qid] << value
          end

          parsed_questions.each do |qid, values|
            question = questions[qid].try(:first)
            next unless question
            begin
              parser = "Imports::Assessments::Questions::#{question.type}".constantize
            rescue NameError => e
              p "#{question.type} - #{e}"
              next
            end
            parsed_value = parser.build_answers(values, question, scoring)
            new_results[qid] = parsed_value if parsed_value
          end
          assign.results = new_results
          if assign.completed?
            assign.calculate_scoring
            assign.occupations = Assigns::CalculateOccupations.call!(assign)
            assign.innovation_styles = Assigns::CalculateInnovationStyles.call!(assign)
          end
          assign
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

      private

      def find_or_create_user(data, index)
        last_name, first_name = data['name']&.split(', ')
        # TODO: Remove password and uncommit Invite
        user = User.
               create_with({
                 first_name: first_name,
                 last_name: last_name,
                 password: 'password',
                 password_confirmation: 'password',
                 memberships_attributes: [{
                   client_id: client_id
                 }]
               }).
               find_or_create_by({ email: data['email'] })
        if user.errors.any?
          errors.add(:base, I18n.t('administration.imports.errors.result.error', row: index + SKIP_ROWS, error: user.errors.full_messages.first))
          return
        end
        # user.invite!(importer, client_id) unless user.invited_to_sign_up?
        user.memberships.find_by(client_id: client_id)
      end

      def parse_norm_data(norm_data, assessment_id)
        return nil if norm_data.nil?
        norm_name, norm_type = norm_data.to_s.split(':')
        norm = Norm.
               joining { dimension }.
               joining { dimension.assessments.alias('assessments').on((dimension.assessments.dimension_id == dimension.id) & (dimension.assessments.id == assessment_id)) }.
               where(name: norm_name).
               pluck(:id)
        { id: norm.try(:first), type: norm_type }
      end

      def parse_date(date, index)
        return nil unless date.present?
        return date if date.is_a?(Date) || date.is_a?(Time)
        DateTime.strptime(date.to_s, '%D %r')
      rescue
        errors.add(:base, I18n.t('administration.imports.errors.result.error', row: index + SKIP_ROWS, error: 'Invalid Date :' + date.to_s))
      end
    end
  end
end
