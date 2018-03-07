class CreateSubscriptions < ActiveRecord::Migration[5.1]
  def change
    create_table :subscriptions do |t|
      t.string :endpoint
      t.string :p256dh
      t.string :auth
      t.integer :shop_id

      t.timestamps
    end
  end
end
