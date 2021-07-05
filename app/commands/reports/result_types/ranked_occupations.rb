# frozen_string_literal: true

module Reports
  module ResultTypes
    class RankedOccupations < BaseType
      def call
        get_occupation
        get_occupation_from_db

        {
          key: ranked_occupation['id'],
          name: occupation&.decorate&.display_name,
          config_data: data,
          value: ranked_occupation['value']
        }
      end

      private

      attr_accessor :ranked_occupation, :occupation

      # Fetchs and sorts occupations
      #
      def get_occupation
        # Finds assign
        user_result = context.find_user_result_by(data['assessmentId'])
        # Sorts occupations
        sorted_occupations = (user_result.occupations || []).sort_by { |occupation| occupation['value'] }
        sorted_occupations.reverse! if data['order'] == 'desc'

        # Gets occupation
        @ranked_occupation = sorted_occupations.at(data['position'] - 1) || {}
      end

      # Gets occupations from DB and groups it by ID
      #
      def get_occupation_from_db
        @occupation = Occupation.find_by(id: ranked_occupation['id'])
      end
    end
  end
end
