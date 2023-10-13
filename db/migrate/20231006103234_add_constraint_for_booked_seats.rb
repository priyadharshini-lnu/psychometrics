class AddConstraintForBookedSeats < ActiveRecord::Migration[7.0]
  def change
    add_check_constraint :workshops, 'booked_seats >= 0', name: 'booked_seats_positive'
    add_check_constraint :workshops, 'booked_seats <= total_seats', name: 'booked_seats_not_exceed_total_seats'
  end
end
