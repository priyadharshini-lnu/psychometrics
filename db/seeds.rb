# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

User.create(
  email: 'superadmin@example.com',
  password: 'password',
  role: :superadmin,
  first_name: 'Jon',
  last_name: 'Snow'
) if User.all.empty?

Notification.create(
                [{ text: 'first message' }, { text: 'second message' }, { text: 'third message' }]
) if Notification.all.empty?
