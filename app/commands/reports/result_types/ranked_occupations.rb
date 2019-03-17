module Reports
  module ResultTypes
    class RankedOccupations < BaseType
      def call
        get_ranked_occupations
        get_occupations_from_db

        ranked_occupations.map do |item|
          {
            key: item['id'],
            name: occupations[item['id']].first.decorate.display_name,
            value: item['value']
          }
        end
      end

      private

      attr_accessor :ranked_occupations, :occupations

      # Fetchs and sorts occupations
      #
      def get_ranked_occupations
        # Finds assign
        assign = context.find_assign_by(data['assessmentId'])
        # Sorts occupations
        sorted_occupations = assign.occupations.sort_by { |occupation| occupation['value'] }
        sorted_occupations.reverse! if data['order'] == 'desc'

        # Limits occupations
        @ranked_occupations = sorted_occupations.first(data['limit'])
      end

      # Gets occupations from DB and groups it by ID
      #
      def get_occupations_from_db
        occupation_ids = ranked_occupations.map { |item| item['id'] }.compact
        @occupations = Occupation.where(id: occupation_ids).group_by(&:id)
      end
    end
  end
end
